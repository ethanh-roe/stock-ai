import httpx
from app.models import stockModels
from fastapi import HTTPException
import finnhub
import os
from dotenv import load_dotenv
from typing import List
from datetime import datetime, timedelta

load_dotenv()
FINNHUB_KEY = os.getenv("FINNHUB_KEY")

async def get_external_stock_profile(ticker: str) -> stockModels.StockProfile:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://finnhub.io/api/v1/stock/profile2?symbol={ticker.upper()}&token={FINNHUB_KEY}"
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="External API error")
            
        data = response.json()
        
        if not data:
            raise HTTPException(status_code=404, detail="Ticker not found")
            
        return stockModels.StockProfile(**data)

async def get_stock_news(ticker: str) -> List[stockModels.StockNews]:
    to_dt = datetime.now().strftime('%Y-%m-%d')
    from_dt = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://finnhub.io/api/v1/company-news",
            params={
                "symbol": ticker.upper(),
                "from": from_dt,
                "to": to_dt,
                "token": FINNHUB_KEY
            }
        )

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="External API error")
            
        data = response.json()
        
        if not data:
            raise HTTPException(status_code=404, detail=f"No news found for {ticker}")
        
        return [stockModels.StockNews(**item) for item in data]

