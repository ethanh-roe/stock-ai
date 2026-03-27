from app.models import portfolioModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, status
from app.security import user_from_jwt
from app.schema import Portfolio, Position, Ticker, User
from app.database import get_db
import yfinance as yf
from decimal import Decimal

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


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

    portfolios = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

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
                (current_price - position.avg_cost_basis) * position.quantity
            )

        response.append(
            portfolioModels.PositionInfo(
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
