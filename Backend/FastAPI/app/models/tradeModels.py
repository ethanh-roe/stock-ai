from pydantic import BaseModel
from datetime import datetime
from app.schema import TradeType
from decimal import Decimal


class TradeRequest(BaseModel):
    portfolio_id: int
    type: TradeType
    ticker: str
    asset_name: str
    quantity: Decimal
    price: Decimal


class TradeResult(BaseModel):
    portfolio_id: int
    ticker: str
    quantity: Decimal
    realized_pnl: Decimal
