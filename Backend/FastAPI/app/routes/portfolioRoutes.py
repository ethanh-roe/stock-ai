from app.models import portfolioModels
from typing import List
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    user_from_jwt,
)
import app.schema as schema
from app.database import get_db

router = APIRouter()


@router.post(
    "/portfolios/create/",
    response_model=portfolioModels.PortfolioInfo,
    summary="Creates a new portfolio for user",
    description="""
             Requires JWT Authorization header. Returns created portfolio information.
             """,
)
def portfolio_createnew(
    portfolio_in: portfolioModels.PortfolioCreate,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    user_id = current_user["user_id"]
    new_portfolio = schema.Portfolio(user_id=user_id, name=portfolio_in.name)

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
    "/portfolios/listall/",
    response_model=List[portfolioModels.PortfolioInfo],
    summary="Grabs all portfolios for user",
    description="""
                Requires JWT authorization header. Returns list of portfolios, including their name, id, and creation date.
            """,
)
def portfolio_listall(
    current_user=Depends(user_from_jwt), db: Session = Depends(get_db)
):
    user_id = current_user["user_id"]

    portfolios = (
        db.query(schema.Portfolio).filter(schema.Portfolio.user_id == user_id).all()
    )

    return portfolios
