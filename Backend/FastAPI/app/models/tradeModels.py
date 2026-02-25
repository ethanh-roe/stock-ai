from pydantic import BaseModel
from datetime import datetime
from app.schema import TradeType

# For requesting that an asset be added to a portfolio
# Initialized with zero shares held
# Clunky, but probably necessary to make trades reference back to existing assets
class AssetAdd(BaseModel):
    portfolio_id: int
    symbol: int
    name: str
    
class AssetInfo(BaseModel):
    portfolio_id: int
    symbol: int
    name: str
    quantity: float
    
class TradeRequest(BaseModel):
    id: int
    portfolio_id: int
    type: TradeType
    asset_id: int
    quantity: int
    price: int
    
    

