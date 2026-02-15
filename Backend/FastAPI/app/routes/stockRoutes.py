from fastapi import APIRouter, Path, Query
from app.models import stockModels
from app.services import stockServices
import yfinance as yf

router = APIRouter(prefix="/data", tags=["data"])

@router.get("/{ticker}/profile", response_model=stockModels.StockProfile)
async def read_stock_profile(
    ticker: str = Path(..., min_length=1, max_length=5)
):
    profile = await stockServices.get_external_stock_profile(ticker)
    return profile

@router.get("/{ticker}/history")
async def get_stock_history(
    ticker: str = Path(..., min_length=1, max_length=5),
    period: str = Query("1d", enum=["1d", "5d", "1mo", "3mo", "1y", "max"])
):  
    interval_map = {
        "1d": "1m", 
        "5d": "5m", 
        "1mo": "30m", 
        "3mo": "1h",  
        "1y": "1d",  
        "max": "1wk"  
    }
    
    selected_interval = interval_map.get(period, "1d")
    
    stock = yf.Ticker(ticker)
    df = stock.history(period=period, interval=selected_interval)
    
    chart_data = []
    for timestamp, row in df.iterrows():
        chart_data.append({
            "time": int(timestamp.timestamp()), 
            "value": round(float(row["Close"]), 2)
        })
        
    return chart_data
    
