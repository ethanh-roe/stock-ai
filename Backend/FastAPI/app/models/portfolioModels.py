from pydantic import BaseModel
from datetime import datetime


class PortfolioCreate(BaseModel):
    name: str
    initial_balance: int


class PortfolioInfo(BaseModel):
    portfolio_id: int
    name: str
    creation_date: datetime

    class Config:
        # allows SQLAlchemy objects to be returned directly
        orm_mode = True
