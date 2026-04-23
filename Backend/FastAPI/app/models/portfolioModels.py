from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, List


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
    position_id: int
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
    new_name: str = Field(..., min_length=1, max_length=100)


class Portfolio_Cash_Xfer_Response(BaseModel):
    portfolio_id: int
    new_cash_balance: Decimal


# Request to transfer partial/full position from one portfolio to another
class Position_Transfer(BaseModel):
    from_portfolio_id: int
    to_portfolio_id: int
    ticker: str
    quantity: int


# -------------------------
# Snapshot / Activity models
# -------------------------

class SnapshotPoint(BaseModel):
    recorded_at: datetime
    total_value: Decimal


class PositionSnapshotPoint(BaseModel):
    recorded_at: datetime
    market_value: Decimal


class SnapshotSummary(BaseModel):
    current_value: Decimal
    period_return_dollars: Optional[Decimal]
    period_return_pct: Optional[Decimal]
    all_time_high: Optional[Decimal]
    pct_below_ath: Optional[Decimal]
    cash_balance: Decimal
    cash_pct: Optional[Decimal]


class SnapshotResponse(BaseModel):
    snapshots: List[SnapshotPoint]
    breakdown: Optional[Dict[str, List[PositionSnapshotPoint]]]
    summary: SnapshotSummary


class ActivityItem(BaseModel):
    trade_id: int
    ticker: str
    trade_type: str
    quantity: Decimal
    price: Decimal
    executed_at: datetime
