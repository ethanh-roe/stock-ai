from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


class PortfolioCreate(BaseModel):
    name: str
    initial_balance: Decimal


class PortfolioInfo(BaseModel):
    id: int
    name: str
    created_at: datetime
    cash_balance: Decimal

    class Config:
        # allows SQLAlchemy objects to be returned directly
        orm_mode = True


class PositionInfo(BaseModel):
    portfolio_id: int
    ticker: str
    quantity: Decimal
    avg_cost_basis: Decimal
    
    # Valuation fields
    current_price: Decimal
    total_value: Decimal
    unrealized_gain: Decimal


class Portfolio_Cash_Xfer_Request(BaseModel):
    portfolio_id: int
    xfer_amount: Decimal

class Portfolio_rename(BaseModel):
    portfolio_id: int
    new_name: str = Field(..., min_length = 1, max_length = 100)

class Portfolio_Cash_Xfer_Response(BaseModel):
    portfolio_id: int
    new_cash_balance: Decimal
