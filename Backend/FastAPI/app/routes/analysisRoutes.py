from fastapi import APIRouter
from app.agents.analysisAgent import run_analysis
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class AnalyzeRequest(BaseModel):
    ticker: str
    prompt: str

@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    return await run_analysis(ticker=request.ticker, prompt=request.prompt)
