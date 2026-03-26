from fastapi import Depends, HTTPException, APIRouter, status
from app.security import user_from_jwt
from app.schema import Portfolio, Position, Ticker, User
from app.database import get_db
from app.agents.analysisAgent import run_analysis
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class AnalyzeRequest(BaseModel):
    ticker: str
    prompt: str

@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    return await run_analysis(ticker=request.ticker, prompt=request.prompt)
