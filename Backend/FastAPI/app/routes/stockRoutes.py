from fastapi import APIRouter, Path
from app.models import stockModels
from app.services import stockServices

router = APIRouter(prefix="/data", tags=["data"])

@router.get("/{ticker}", response_model=stockModels.StockProfile)
async def read_stock_profile(
    ticker: str = Path(..., min_length=1, max_length=5)
):
    profile = await stockServices.get_external_stock_profile(ticker)
    return profile
