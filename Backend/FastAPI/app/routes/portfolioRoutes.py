from app.models import portfolioModels
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, status, Query
from app.security import user_from_jwt
from app.schema import (
    Portfolio,
    Position,
    PortfolioSnapshot,
    PositionSnapshot,
    Ticker,
    User,
    LeagueMember,
    League,
    LeagueStatus,
    Transfer,
    Trade,
    TradeType,
)
from app.database import get_db
import yfinance as yf
from decimal import Decimal
from datetime import datetime, timedelta

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


# This is the logic to handle transfering positions between portfolios.
def position_transfer_service(
    db: Session,
    user_id: int,
    from_portfolio_id: int,
    to_portfolio_id: int,
    ticker: str,
    quantity: Decimal,
):
    # Check that we're not transfering to and from the same portfolio
    if from_portfolio_id == to_portfolio_id:
        raise HTTPException(status_code=400, detail="Cannot transfer to same portfolio")

    # Check that a valid quantity was given
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    
    # Start an atomic database transaction
    with db.begin():
        
        # First, validate existence & Onwership of portfolios
        portfolios = (
            db.query(Portfolio)
            .filter(
                Portfolio.id.in_([from_portfolio_id, to_portfolio_id]),
                Portfolio.user_id == user_id,
            )
            .all()
        )

        if len(portfolios) != 2:
            raise HTTPException(status_code=403, detail="Invalid portfolio ownership")

        # Check if portfolio is tied to a currently active league
        active_league = (
            db.query(LeagueMember)
            .join(League)
            .filter(
                LeagueMember.portfolio_id.in_([from_portfolio_id, to_portfolio_id]),
                League.status == LeagueStatus.ACTIVE,
            )
            .first()
        )

        if active_league:
            raise HTTPException(
                status_code=400, detail="Transfers disabled in active leagues"
            )
            
        # Grab actual ticker from db
        ticker_obj = (
            db.query(Ticker).filter(Ticker.symbol == ticker).first()
        )
        
        if not ticker_obj:
            raise HTTPException(status_code=404, detail="Specified ticker not found")

        # Grab source position; determine if enough shares owned by source portfolio
        src_pos = (
            db.query(Position)
            .filter_by(portfolio_id=from_portfolio_id, ticker_id=ticker_obj.id)
            .first()
        )

        if not src_pos or src_pos.quantity < quantity:
            raise HTTPException(status_code=400, detail="Insufficient shares")

        cost_basis = src_pos.avg_cost_basis

        # Grab destination position, if it already exists
        dst_pos = (
            db.query(Position)
            .filter_by(portfolio_id=to_portfolio_id, ticker_id=ticker_obj.id)
            .first()
        )

        # Update Source Position
        src_pos.quantity -= quantity
        if src_pos.quantity <= 0:
            db.delete(src_pos)
        
        # Update or create destination position
        if dst_pos:
            new_qty = dst_pos.quantity + quantity
            dst_pos.avg_cost_basis = (
                (dst_pos.quantity * dst_pos.avg_cost_basis) + (quantity * cost_basis)
            ) / new_qty
            dst_pos.quantity = new_qty
        else:
            dst_pos = Position(
                portfolio_id=to_portfolio_id,
                ticker_id=ticker_obj.id,
                quantity=quantity,
                avg_cost_basis=cost_basis,
            )
            db.add(dst_pos)

        # Create record of transfer for bookkeeping
        transfer = Transfer(
            from_portfolio_id=from_portfolio_id,
            to_portfolio_id=to_portfolio_id,
            ticker_id=ticker_obj.id,
            quantity=quantity,
            cost_basis=cost_basis,
        )
        db.add(transfer)
        db.flush()  # get transfer.id

        # Create synthetic trades for more bookkeeping
        db.add_all(
            [
                Trade(
                    portfolio_id=from_portfolio_id,
                    ticker_id=ticker_obj.id,
                    trade_type=TradeType.SELL,
                    quantity=quantity,
                    price=cost_basis,
                    realized_pnl=0,
                    transfer_id=transfer.id,
                ),
                Trade(
                    portfolio_id=to_portfolio_id,
                    ticker_id=ticker_obj.id,
                    trade_type=TradeType.BUY,
                    quantity=quantity,
                    price=cost_basis,
                    realized_pnl=0,
                    transfer_id=transfer.id,
                ),
            ]
        )

        return portfolioModels.Position_Transfer(
            from_portfolio_id=from_portfolio_id,
            to_portfolio_id=to_portfolio_id,
            ticker=ticker,
            quantity=quantity,
        )


@router.post(
    "/create",
    response_model=portfolioModels.PortfolioInfo,
    summary="Creates a new portfolio for user",
    description="Requires JWT Authorization header, and for user to have required cash balance to fund initial portfolio balance. Updates user's cash balance on portfolio creation. Returns created portfolio information.",
)
def portfolio_createnew(
    portfolio_in: portfolioModels.PortfolioCreate,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    user_id = current_user.user_id

    # Lock users to prevent race conditions
    user = db.execute(
        select(User).where(User.id == user_id).with_for_update()
    ).scalar_one()

    # Prevent negative initial balances (No infinite money please)
    if portfolio_in.initial_balance < 0:
        raise HTTPException(
            status_code=400, detail="Initial balance cannot be negative"
        )

    # Check that user has sufficient funds
    if portfolio_in.initial_balance > user.cash_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds to create portfolio with specified initial balance",
        )

    # Deduct initial portfolio balance from User's cash balance
    user.cash_balance -= portfolio_in.initial_balance

    # Create Portfolio
    new_portfolio = Portfolio(
        user_id=user_id,
        name=portfolio_in.name,
        cash_balance=portfolio_in.initial_balance,
    )

    try:
        db.add(new_portfolio)
        db.commit()
        db.refresh(new_portfolio)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem adding portfolio")

    response = portfolioModels.PortfolioInfo(
        name=new_portfolio.name,
        id=new_portfolio.id,
        created_at=new_portfolio.created_at,
        cash_balance=new_portfolio.cash_balance,
    )

    return response


@router.patch(
    "/rename",
    summary="Rename a portfolio",
    description="Updates the name of a portfolio owned by the user.",
    response_model=portfolioModels.Portfolio_rename,
)
def portfolio_rename(
    request: portfolioModels.Portfolio_rename,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    # fetch portfolio
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == request.portfolio_id,
            Portfolio.user_id == current_user.user_id,
            Portfolio.deleted_at.is_(None),
        )
        .first()
    )

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or not owned by user.",
        )

    # Update name
    portfolio.name = request.new_name.strip()

    # Attempt to commit change
    try:
        db.commit()
        db.refresh(portfolio)

        return portfolioModels.Portfolio_rename(
            portfolio_id=request.portfolio_id, new_name=request.new_name.strip()
        )
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rename portfolio.",
        )


@router.delete(
    "/{portfolio_id}/delete",
    summary="Delete portfolio with given ID",
    description="Attempts to delete the portfolio with given ID. The relevant portfolio must exist, be owned by the user, have zero cash balance, and no currently held positions.",
)
def portfolio_delete(
    portfolio_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    # First find and grab portfolio
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.user_id)
        .first()
    )
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or not owned by user.",
        )

    # Determine if portfolio has already been deleted
    if portfolio.deleted_at is not None:
        return {"message": "Portfolio already deleted."}

    # Determine if portfolio has outstanding cash balance
    # Note: Checking if greater than 1 cent in case rounding errors pop up
    if portfolio.cash_balance > 0.01:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Portfolio still holds a positive cash balance.",
        )

    # Next, attempt to find and grab portfolio positions
    results = (
        db.query(Position, Ticker)
        .join(Ticker, Position.ticker_id == Ticker.id)
        .filter(Position.portfolio_id == portfolio_id)
        .all()
    )
    # check if empty
    if results:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Portfolio still holds one or more active positions.",
        )

    # Now soft delete portfolio in database
    portfolio.deleted_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(portfolio)
        return {"message": "Portfolio deleted successfully"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete portfolio.",
        )


@router.get(
    "/listall",
    response_model=List[portfolioModels.PortfolioInfo],
    summary="Grabs all portfolios for user",
    description="Requires JWT authorization header. Returns list of portfolios, including their name, id, and creation date.",
)
def portfolio_listall(
    current_user=Depends(user_from_jwt), db: Session = Depends(get_db)
):
    user_id = current_user.user_id

    portfolios = (
        db.query(Portfolio)
        .filter(Portfolio.user_id == user_id, Portfolio.deleted_at.is_(None))
        .all()
    )

    return portfolios


@router.get(
    "/{portfolio_id}/positions",
    summary="Returns held positions in portfolio",
    description="Requires valid JWT. Returns a json object containing all held positions contained within a given portfolio. Performs request validation and error handling.",
    response_model=List[portfolioModels.PositionInfo],
)
def get_positions(
    portfolio_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    # -------------------------
    # 1. Validate Ownership
    # -------------------------
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.user_id)
        .first()
    )

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found or not owned by user.",
        )

    # -------------------------
    # 2. Query Positions + Ticker
    # -------------------------
    results = (
        db.query(Position, Ticker)
        .join(Ticker, Position.ticker_id == Ticker.id)
        .filter(Position.portfolio_id == portfolio_id)
        .all()
    )

    # Extract tickers & values
    ticker_symbols = [ticker.symbol for _, ticker in results]

    price_map = {}

    if ticker_symbols:
        ticker_str = " ".join(ticker_symbols)
        yf_tickers = yf.Tickers(ticker_str)

        for symbol in ticker_symbols:
            try:
                price = yf_tickers.tickers[symbol].info["regularMarketPrice"]
                price_map[symbol] = Decimal(str(price))
            except Exception:
                price_map[symbol] = None

    # -------------------------
    # 3. Format Response
    # -------------------------
    response = []

    for position, ticker in results:
        current_price = price_map.get(ticker.symbol)

        total_value = None
        unrealized_gain = None

        if current_price is not None:
            total_value = current_price * position.quantity
            unrealized_gain = (
                current_price - position.avg_cost_basis
            ) * position.quantity

        response.append(
            portfolioModels.PositionInfo(
                position_id=position.id,
                portfolio_id=portfolio_id,
                ticker=ticker.symbol,
                quantity=position.quantity,
                avg_cost_basis=position.avg_cost_basis,
                current_price=current_price,
                total_value=total_value,
                unrealized_gain=unrealized_gain,
            )
        )

    return response


@router.put(
    "/cash_in",
    response_model=portfolioModels.Portfolio_Cash_Xfer_Response,
    summary="Transfers funds from user's cash balance to the portfolio's cash balance.",
    description="Requires JWT authorization header. Attempts to add a specified amount to given portfolio id, checking for ownership of portfolio as well as sufficient user cash balance.",
)
def portfolio_cash_in(
    xfer_info: portfolioModels.Portfolio_Cash_Xfer_Request,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    user_id = current_user.user_id
    portfolio_id = xfer_info.portfolio_id

    # Grab User
    user = db.execute(
        select(User).where(User.id == user_id).with_for_update()
    ).scalar_one()

    # Prevent negative xfer amount balances (No infinite money please)
    if xfer_info.xfer_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Use /portfolios/xfer_cash_out to deduct funds from portfolio",
        )

    # Check that user has sufficient funds
    if xfer_info.xfer_amount > user.cash_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds to transfer specified amount into portfolio",
        )

    # Grab Portfolio
    try:
        portfolio = db.execute(
            select(Portfolio).where(Portfolio.id == portfolio_id).with_for_update()
        ).scalar_one()
    except NoResultFound:
        raise HTTPException(
            status_code=404, detail=f"Portfolio with ID {portfolio_id} not found"
        )

    # Check for ownership
    if portfolio.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to modify this portfolio",
        )

    # Deduct amount from user
    user.cash_balance -= xfer_info.xfer_amount

    # Add amount to portfolio
    portfolio.cash_balance += xfer_info.xfer_amount

    try:
        db.commit()
        db.refresh(portfolio)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem adding funds to portfolio")

    response = portfolioModels.Portfolio_Cash_Xfer_Response(
        portfolio_id=portfolio.id,
        new_cash_balance=portfolio.cash_balance,
    )

    return response


@router.put(
    "/cash_out",
    response_model=portfolioModels.Portfolio_Cash_Xfer_Response,
    summary="Transfers funds from portfolio's cash balance to the user's cash balance.",
    description="Requires JWT authorization header. Attempts to deduct a specified amount from given portfolio id, checking for ownership of portfolio as well as sufficient portfolio cash balance.",
)
def portfolio_cash_out(
    xfer_info: portfolioModels.Portfolio_Cash_Xfer_Request,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    user_id = current_user.user_id
    portfolio_id = xfer_info.portfolio_id

    # Grab User
    user = db.execute(
        select(User).where(User.id == user_id).with_for_update()
    ).scalar_one()

    # Prevent negative xfer amount balances
    if xfer_info.xfer_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Use /portfolios/xfer_cash_in to add funds to portfolio",
        )

    # Grab Portfolio
    try:
        portfolio = db.execute(
            select(Portfolio).where(Portfolio.id == portfolio_id).with_for_update()
        ).scalar_one()
    except NoResultFound:
        raise HTTPException(
            status_code=404, detail=f"Portfolio with ID {portfolio_id} not found"
        )

    # Check for ownership
    if portfolio.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to modify this portfolio",
        )

    # Check that portfolio has sufficient funds
    if xfer_info.xfer_amount > portfolio.cash_balance:
        raise HTTPException(
            status_code=400,
            detail="Insufficient funds to transfer specified amount from portfolio",
        )

    # deduct amount from portfolio
    portfolio.cash_balance -= xfer_info.xfer_amount

    # add amount to user
    user.cash_balance += xfer_info.xfer_amount

    try:
        db.commit()
        db.refresh(portfolio)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Problem transfering funds to user")

    response = portfolioModels.Portfolio_Cash_Xfer_Response(
        portfolio_id=portfolio.id,
        new_cash_balance=portfolio.cash_balance,
    )

    return response


@router.post(
    "/positiontransfer",
    response_model=portfolioModels.Position_Transfer,
    summary="Transfers a full/partial position from one portfolio to another.",
    description="Attempts to transfer some quanity of shares from one portfolio to another. Must own both portfolios and have enough of specified share to complete transfer.",
)
def position_transfer(
    request: portfolioModels.Position_Transfer,
    db: Session = Depends(get_db),
    current_user=Depends(user_from_jwt),
):
    return position_transfer_service(
        db,
        current_user.user_id,
        request.from_portfolio_id,
        request.to_portfolio_id,
        request.ticker,
        request.quantity,
    )


_RANGE_MAP = {
    "1W": timedelta(weeks=1),
    "1M": timedelta(days=30),
    "3M": timedelta(days=90),
    "1Y": timedelta(days=365),
}


@router.get(
    "/{portfolio_id}/snapshots",
    response_model=portfolioModels.SnapshotResponse,
    summary="Get portfolio performance snapshots",
    description="Returns time-series portfolio value snapshots. Optional range filter: 1W, 1M, 3M, 1Y (omit for all time). Set breakdown=true to include per-ticker lines.",
)
def get_snapshots(
    portfolio_id: int,
    range_param: Optional[str] = Query(None, alias="range", description="1W | 1M | 3M | 1Y"),
    breakdown: bool = Query(False),
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.user_id,
            Portfolio.deleted_at.is_(None),
        )
        .first()
    )
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found or not owned by user.")

    if range_param is not None and range_param not in _RANGE_MAP:
        raise HTTPException(status_code=400, detail="Invalid range. Must be 1W, 1M, 3M, or 1Y.")

    # Fetch snapshots for this portfolio in the requested range
    q = db.query(PortfolioSnapshot).filter(PortfolioSnapshot.portfolio_id == portfolio_id)
    if range_param:
        cutoff = datetime.utcnow() - _RANGE_MAP[range_param]
        q = q.filter(PortfolioSnapshot.recorded_at >= cutoff)
    snapshots = q.order_by(PortfolioSnapshot.recorded_at).all()

    # All-time high across all snapshots (independent of range filter)
    ath = db.query(func.max(PortfolioSnapshot.total_value)).filter(
        PortfolioSnapshot.portfolio_id == portfolio_id
    ).scalar()

    # Current value: latest snapshot total, or cash balance if no snapshots yet
    current_value = snapshots[-1].total_value if snapshots else portfolio.cash_balance

    # Period return relative to the first snapshot in the selected range
    period_return_dollars = None
    period_return_pct = None
    if snapshots:
        range_start = snapshots[0].total_value
        period_return_dollars = current_value - range_start
        if range_start != 0:
            period_return_pct = (period_return_dollars / range_start) * Decimal("100")

    # % below all-time high (negative means below ATH)
    pct_below_ath = None
    if ath and ath != 0:
        pct_below_ath = ((current_value - ath) / ath) * Decimal("100")

    # Cash as % of portfolio
    cash_pct = None
    if current_value and current_value != 0:
        cash_pct = (portfolio.cash_balance / current_value) * Decimal("100")

    summary = portfolioModels.SnapshotSummary(
        current_value=current_value,
        period_return_dollars=period_return_dollars,
        period_return_pct=period_return_pct,
        all_time_high=ath,
        pct_below_ath=pct_below_ath,
        cash_balance=portfolio.cash_balance,
        cash_pct=cash_pct,
    )

    # Per-ticker breakdown lines (only when requested and snapshots exist)
    breakdown_map = None
    if breakdown and snapshots:
        snapshot_ids = [s.id for s in snapshots]
        pos_rows = (
            db.query(PositionSnapshot, Ticker)
            .join(Ticker, PositionSnapshot.ticker_id == Ticker.id)
            .filter(PositionSnapshot.portfolio_snapshot_id.in_(snapshot_ids))
            .order_by(PositionSnapshot.recorded_at)
            .all()
        )
        breakdown_map = {}
        for ps, ticker in pos_rows:
            breakdown_map.setdefault(ticker.symbol, []).append(
                portfolioModels.PositionSnapshotPoint(
                    recorded_at=ps.recorded_at,
                    market_value=ps.market_value,
                )
            )

    return portfolioModels.SnapshotResponse(
        snapshots=[
            portfolioModels.SnapshotPoint(recorded_at=s.recorded_at, total_value=s.total_value)
            for s in snapshots
        ],
        breakdown=breakdown_map,
        summary=summary,
    )


@router.get(
    "/{portfolio_id}/activity",
    response_model=List[portfolioModels.ActivityItem],
    summary="Get recent portfolio activity",
    description="Returns the most recent trades for a portfolio, newest first. Default limit 10, max 100.",
)
def get_activity(
    portfolio_id: int,
    limit: int = Query(10, ge=1, le=100),
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == current_user.user_id,
            Portfolio.deleted_at.is_(None),
        )
        .first()
    )
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found or not owned by user.")

    results = (
        db.query(Trade, Ticker)
        .join(Ticker, Trade.ticker_id == Ticker.id)
        .filter(Trade.portfolio_id == portfolio_id)
        .order_by(Trade.executed_at.desc())
        .limit(limit)
        .all()
    )

    return [
        portfolioModels.ActivityItem(
            trade_id=trade.id,
            ticker=ticker.symbol,
            trade_type=trade.trade_type.value,
            quantity=trade.quantity,
            price=trade.price,
            executed_at=trade.executed_at,
        )
        for trade, ticker in results
    ]
