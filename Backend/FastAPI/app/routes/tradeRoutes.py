from app.models import tradeModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, status
from app.security import user_from_jwt
from app.schema import Ticker, Portfolio, Position, Trade, TradeType
from app.database import get_db
from decimal import Decimal


router = APIRouter(prefix="/trades", tags=["trades"])


@router.post(
    "/newtrade",
    summary="Perform a trade.",
    description="Requires valid JWT. Given trade information in form TradeRequest, attempts to perform trade. Performs error handling + validation of request.",
    response_model=tradeModels.PositionInfo,
    status_code=201,
)
def newTrade(
    request: tradeModels.TradeRequest,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    with db.begin():  # atomic transaction
        # -------------------------
        # Validate request values
        # -------------------------
        if request.price < 0:
            raise HTTPException(
                status_code=400,
                detail="Price cannot be negative",
            )
        if request.quantity < 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity of shares cannot be negative",
            )

        # -------------------------
        # Lock Portfolio Row
        # -------------------------
        portfolio = (
            db.query(Portfolio)
            .filter(
                Portfolio.id == request.portfolio_id,
                Portfolio.user_id == current_user.user_id,
            )
            .with_for_update()
            .first()
        )

        if not portfolio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio not found or not owned by user.",
            )

        # -------------------------
        # Get or Create Ticker (no lock needed)
        # -------------------------
        ticker = (
            db.query(Ticker).filter(Ticker.symbol == request.ticker.upper()).first()
        )

        if not ticker:
            ticker = Ticker(symbol=request.ticker.upper(), name=request.asset_name)
            db.add(ticker)
            db.flush()  # get ticker.id safely

        # -------------------------
        # Lock Position Row (if exists)
        # -------------------------
        position = (
            db.query(Position)
            .filter(
                Position.portfolio_id == portfolio.id, Position.ticker_id == ticker.id
            )
            .with_for_update()
            .first()
        )

        quantity = Decimal(request.quantity)
        price = Decimal(request.price)
        total_value = quantity * price

        realized_pnl = Decimal("0")

        # -------------------------
        # BUY
        # -------------------------
        if request.type == TradeType.BUY:

            if portfolio.cash_balance < total_value:
                raise HTTPException(status_code=400, detail="Insufficient cash.")

            portfolio.cash_balance -= total_value

            if not position:
                position = Position(
                    portfolio_id=portfolio.id,
                    ticker_id=ticker.id,
                    quantity=quantity,
                    avg_cost_basis=price,
                )
                db.add(position)
            else:
                new_qty = position.quantity + quantity
                new_avg = (
                    (position.quantity * position.avg_cost_basis) + (quantity * price)
                ) / new_qty

                position.quantity = new_qty
                position.avg_cost_basis = new_avg

        # -------------------------
        # SELL
        # -------------------------
        elif request.type == TradeType.SELL:

            if not position or position.quantity < quantity:
                raise HTTPException(
                    status_code=400, detail="Not enough shares to sell."
                )

            realized_pnl = (price - position.avg_cost_basis) * quantity

            portfolio.cash_balance += total_value
            position.quantity -= quantity

            if position.quantity == 0:
                db.delete(position)

        else:
            raise HTTPException(status_code=400, detail="Invalid trade type.")

        # -------------------------
        # Record Trade
        # -------------------------
        trade = Trade(
            portfolio_id=portfolio.id,
            ticker_id=ticker.id,
            trade_type=request.type,
            quantity=quantity,
            price=price,
            realized_pnl=realized_pnl if request.type == TradeType.SELL else None,
        )

        db.add(trade)

    # commit happens automatically here

    # -------------------------
    # Response
    # -------------------------
    return tradeModels.PositionInfo(
        portfolio_id=portfolio.id,
        ticker=ticker.symbol,
        quantity=position.quantity if position else Decimal("0"),
        realized_pnl=realized_pnl,
    )
