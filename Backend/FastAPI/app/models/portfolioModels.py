from pydantic import BaseModel
from datetime import datetime


class PortfolioCreate(BaseModel):
    name: str
    initial_balance: int


class PortfolioInfo(BaseModel):
    id: int
    name: str
    created_at: datetime
    cash_balance: int

    class Config:
        # allows SQLAlchemy objects to be returned directly
        orm_mode = True
