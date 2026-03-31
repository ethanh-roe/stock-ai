from pydantic import BaseModel
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from app.schema import LeagueStatus


# -------------------------
# League creation
# -------------------------
class LeagueCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    portfolio_id: int  # creator's entered portfolio


# -------------------------
# League preview (no auth required — shown before joining)
# -------------------------
class LeaguePreview(BaseModel):
    id: int
    name: str
    description: Optional[str]
    start_date: date
    end_date: Optional[date]
    status: LeagueStatus
    member_count: int
    invite_code: str

    class Config:
        orm_mode = True


# -------------------------
# Full league detail (auth required)
# -------------------------
class LeagueInfo(BaseModel):
    id: int
    name: str
    description: Optional[str]
    start_date: date
    end_date: Optional[date]
    status: LeagueStatus
    invite_code: str
    created_at: datetime
    created_by: int
    member_count: int

    class Config:
        orm_mode = True


# -------------------------
# Join request
# -------------------------
class JoinLeagueRequest(BaseModel):
    portfolio_id: int


# -------------------------
# Leaderboard
# -------------------------
class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    portfolio_id: int
    portfolio_name: str
    start_value: Decimal
    current_value: Decimal
    growth_pct: Decimal          # (current - start) / start * 100
    sparkline: list[Decimal]     # ordered list of daily total_values for the chart


class LeaderboardResponse(BaseModel):
    league: LeagueInfo
    top_gain: Decimal            # highest growth_pct in the league
    avg_growth: Decimal          # mean growth_pct across all members
    days_remaining: Optional[int]
    entries: list[LeaderboardEntry]


# -------------------------
# Snapshot time-series (race chart)
# -------------------------
class SnapshotPoint(BaseModel):
    recorded_at: datetime
    total_value: Decimal


class MemberSnapshotHistory(BaseModel):
    user_id: int
    username: str
    portfolio_id: int
    snapshots: list[SnapshotPoint]
