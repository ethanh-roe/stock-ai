from app.models import portfolioModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
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
    user_id = current_user["user_id"]

    # Lock users to prevent race conditions
    user = db.execute(
        select(schema.User).where(schema.User.id == user_id).with_for_update()
    ).scalar_one()

    # Prevent negative initial balances (No infinite money please)
    if portfolio_in.initial_balance < 0:
        raise HTTPException(status_code=400, detail="Initial balance cannot be negative")
    
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
        portfolio_id=new_portfolio.portfolio_id,
        creation_date=new_portfolio.creation_date,
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
    user_id = current_user["user_id"]

    portfolios = (
        db.query(schema.Portfolio).filter(schema.Portfolio.user_id == user_id).all()
    )

    return portfolios
