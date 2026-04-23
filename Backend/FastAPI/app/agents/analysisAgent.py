import asyncio
from dataclasses import dataclass
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field
from agents import Agent, GenerateDynamicPromptData, Runner

class AnalysisOutput(BaseModel):
    recommendation: Literal["BUY", "SELL", "HOLD"]
    recommendationRationale: str
    confidence: float = Field(..., ge=0.0, le=100.0)
    confidenceRationale: str
    summary: str
    momentumScore: float
    momentumLabel: Literal["Strong", "Moderate", "Weak"]
    momentumRationale: str
    riskLevel: Literal["Low", "Medium", "High"]
    riskRationale: str

@dataclass
class AnalysisPromptContext:
    prompt_id: str
    ticker: str

async def build_prompt(data: GenerateDynamicPromptData):
    ctx: AnalysisPromptContext = data.context.context
    return {
        "id": ctx.prompt_id,
        "version": "1",
        "variables": {"ticker": ctx.ticker},
    }

analysis_agent = Agent(
    name="Stock Analysis Agent",
    output_type=AnalysisOutput,
    instructions=(
        "You are a stock analysis assistant. "
        "Given a stock ticker and market data, return a structured analysis "
        "with a BUY/SELL/HOLD recommendation and a 1-2 sentence rationale for that recommendation, "
        "confidence (0-100) and a 1-2 sentence rationale explaining what drives that confidence level, "
        "summary, momentum score (0-100) and a 1-2 sentence rationale explaining the momentum, "
        "momentum label (Strong/Moderate/Weak), "
        "and risk level (Low/Medium/High) and a 1-2 sentence rationale explaining the key risk factors."
    ),
)

async def run_analysis(ticker: str, prompt: str) -> AnalysisOutput:
    user_message = f"Ticker: {ticker}\n\n{prompt}"
    result = await Runner.run(analysis_agent, user_message)
    return result.final_output
