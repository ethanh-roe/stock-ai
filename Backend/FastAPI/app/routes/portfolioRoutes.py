from app.models import portfolioModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import user_from_jwt
import app.schema as schema
from app.database import get_db


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
        select(schema.User).where(schema.User.id == user_id).with_for_update()
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
    new_portfolio = schema.Portfolio(
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

    portfolios = (
        db.query(schema.Portfolio).filter(schema.Portfolio.user_id == user_id).all()
    )

    return portfolios


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
        select(schema.User).where(schema.User.id == user_id).with_for_update()
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
            select(schema.Portfolio)
            .where(schema.Portfolio.id == portfolio_id)
            .with_for_update()
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
        select(schema.User).where(schema.User.id == user_id).with_for_update()
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
            select(schema.Portfolio)
            .where(schema.Portfolio.id == portfolio_id)
            .with_for_update()
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
