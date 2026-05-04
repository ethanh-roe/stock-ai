import secrets
from datetime import date
from decimal import Decimal
from typing import List

import yfinance as yf
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import leagueModels
from app.schema import (
    League,
    LeagueMember,
    LeagueStatus,
    Portfolio,
    PortfolioSnapshot,
    Position,
    SnapshotType,
    Ticker,
    User,
)
from app.security import user_from_jwt

"""
Note:
    Authentication for these routes is using 'user_from_jwt' instead of 'get_current_active_user'.
    The former just extracts the raw user info (user_id) from the JWT, while the latter
    actually queries to get the User object.
    I at one point had redone this to use the latter, but it broke some DB queries, so I have 
    reverted this file to the version that uses the former.
    
    Sorry for the inconsistency.
"""


router = APIRouter(prefix="/leagues", tags=["leagues"])


# -------------------------
# Helpers
# -------------------------


def _compute_portfolio_value(portfolio: Portfolio, db: Session) -> Decimal:
    """Return cash + current market value of all positions."""
    results = (
        db.query(Position, Ticker)
        .join(Ticker, Position.ticker_id == Ticker.id)
        .filter(Position.portfolio_id == portfolio.id)
        .all()
    )

    total = Decimal(str(portfolio.cash_balance))

    if not results:
        return total

    symbols = [ticker.symbol for _, ticker in results]
    yf_data = yf.Tickers(" ".join(symbols))

    for position, ticker in results:
        try:
            price = Decimal(
                str(yf_data.tickers[ticker.symbol].info["regularMarketPrice"])
            )
        except Exception:
            price = (
                position.avg_cost_basis
            )  # fallback to cost basis if price unavailable
        total += price * position.quantity

    return total


def _refresh_status(league: League, db: Session) -> None:
    """Advance league status based on today's date. Commits if changed."""
    today = date.today()
    changed = False

    if league.status == LeagueStatus.PENDING and league.start_date <= today:
        league.status = LeagueStatus.ACTIVE
        changed = True

    if (
        league.status == LeagueStatus.ACTIVE
        and league.end_date is not None
        and league.end_date < today
    ):
        league.status = LeagueStatus.ENDED
        changed = True

    if changed:
        db.commit()


def _league_info(league: League, db: Session) -> leagueModels.LeagueInfo:
    member_count = (
        db.query(LeagueMember).filter(LeagueMember.league_id == league.id).count()
    )
    return leagueModels.LeagueInfo(
        id=league.id,
        name=league.name,
        description=league.description,
        start_date=league.start_date,
        end_date=league.end_date,
        status=league.status,
        invite_code=league.invite_code,
        created_at=league.created_at,
        created_by=league.created_by,
        member_count=member_count,
    )


# -------------------------
# POST /leagues/create
# -------------------------
@router.post(
    "/create",
    response_model=leagueModels.LeagueInfo,
    status_code=201,
    summary="Create a new league",
    description="Creates a league and enters the creator with their chosen portfolio. "
    "start_date is when the league locks and baselines are recorded.",
)
def create_league(
    body: leagueModels.LeagueCreate,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    if body.start_date <= date.today():
        raise HTTPException(status_code=400, detail="start_date must be in the future")

    if body.end_date and body.end_date <= body.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    # Verify the creator owns the chosen portfolio
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == body.portfolio_id,
            Portfolio.user_id == current_user.user_id,
        )
        .first()
    )
    if not portfolio:
        raise HTTPException(
            status_code=404, detail="Portfolio not found or not owned by user"
        )

    # Generate a unique invite code
    for _ in range(5):
        code = secrets.token_hex(8)  # 16 hex chars
        if not db.query(League).filter(League.invite_code == code).first():
            break
    else:
        raise HTTPException(
            status_code=500, detail="Could not generate unique invite code"
        )

    league = League(
        name=body.name,
        description=body.description,
        invite_code=code,
        start_date=body.start_date,
        end_date=body.end_date,
        status=LeagueStatus.PENDING,
        created_by=current_user.user_id,
    )

    try:
        db.add(league)
        db.flush()  # get league.id

        member = LeagueMember(
            league_id=league.id,
            user_id=current_user.user_id,
            portfolio_id=body.portfolio_id,
        )
        db.add(member)
        db.commit()
        db.refresh(league)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not create league")

    return _league_info(league, db)


# -------------------------
# GET /leagues/mine
# -------------------------
@router.get(
    "/mine",
    response_model=List[leagueModels.LeagueInfo],
    summary="List leagues the current user belongs to",
)
def list_my_leagues(
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    memberships = (
        db.query(LeagueMember)
        .filter(LeagueMember.user_id == current_user.user_id)
        .all()
    )

    leagues = []
    for m in memberships:
        league = db.query(League).filter(League.id == m.league_id).first()
        if league:
            _refresh_status(league, db)
            leagues.append(_league_info(league, db))

    return leagues


# -------------------------
# GET /leagues/join/{invite_code}  — preview, no auth required
# -------------------------
@router.get(
    "/preview/{invite_code}",
    response_model=leagueModels.LeaguePreview,
    summary="Preview a league by invite code (no auth required)",
    description="Returns league metadata so the user can review before joining.",
)
def preview_league(
    invite_code: str,
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.invite_code == invite_code).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    _refresh_status(league, db)

    member_count = (
        db.query(LeagueMember).filter(LeagueMember.league_id == league.id).count()
    )

    return leagueModels.LeaguePreview(
        id=league.id,
        name=league.name,
        description=league.description,
        start_date=league.start_date,
        end_date=league.end_date,
        status=league.status,
        member_count=member_count,
        invite_code=league.invite_code,
    )


# -------------------------
# GET /leagues/{league_id}
# -------------------------
@router.get(
    "/{league_id}",
    response_model=leagueModels.LeagueInfo,
    summary="Get league detail",
)
def get_league(
    league_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    _refresh_status(league, db)
    return _league_info(league, db)


# -------------------------
# POST /leagues/{league_id}/join
# -------------------------
@router.post(
    "/{league_id}/join",
    response_model=leagueModels.LeagueInfo,
    status_code=201,
    summary="Join a league with a chosen portfolio",
    description="Blocked once the league's start_date has passed.",
)
def join_league(
    league_id: int,
    body: leagueModels.JoinLeagueRequest,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    _refresh_status(league, db)

    if league.status != LeagueStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="League has already started — joining is closed",
        )

    # Check user isn't already a member
    existing = (
        db.query(LeagueMember)
        .filter(
            LeagueMember.league_id == league_id,
            LeagueMember.user_id == current_user.user_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You are already in this league")

    # Verify portfolio ownership
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == body.portfolio_id,
            Portfolio.user_id == current_user.user_id,
        )
        .first()
    )
    if not portfolio:
        raise HTTPException(
            status_code=404, detail="Portfolio not found or not owned by user"
        )

    try:
        member = LeagueMember(
            league_id=league_id,
            user_id=current_user.user_id,
            portfolio_id=body.portfolio_id,
        )
        db.add(member)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Could not join league")

    return _league_info(league, db)


# -------------------------
# GET /leagues/{league_id}/leaderboard
# -------------------------
@router.get(
    "/{league_id}/leaderboard",
    response_model=leagueModels.LeaderboardResponse,
    summary="Get ranked leaderboard for a league",
    description="Computes growth % server-side from baseline snapshot and most recent snapshot. "
    "Members with no baseline yet (league still pending) are excluded.",
)
def get_leaderboard(
    league_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    _refresh_status(league, db)

    members = db.query(LeagueMember).filter(LeagueMember.league_id == league_id).all()

    entries = []

    for member in members:
        baseline = (
            db.query(PortfolioSnapshot)
            .filter(
                PortfolioSnapshot.league_member_id == member.id,
                PortfolioSnapshot.snapshot_type == SnapshotType.BASELINE,
            )
            .first()
        )

        if not baseline:
            continue  # league hasn't started yet for this member

        # Most recent snapshot (daily preferred, else baseline)
        latest = (
            db.query(PortfolioSnapshot)
            .filter(PortfolioSnapshot.league_member_id == member.id)
            .order_by(PortfolioSnapshot.recorded_at.desc())
            .first()
        )

        current_value = latest.total_value

        if baseline.total_value == 0:
            growth_pct = Decimal("0")
        else:
            growth_pct = (
                (current_value - baseline.total_value) / baseline.total_value * 100
            ).quantize(Decimal("0.01"))

        # Sparkline: ordered daily snapshots
        daily_snapshots = (
            db.query(PortfolioSnapshot)
            .filter(
                PortfolioSnapshot.league_member_id == member.id,
                PortfolioSnapshot.snapshot_type == SnapshotType.DAILY,
            )
            .order_by(PortfolioSnapshot.recorded_at.asc())
            .all()
        )
        sparkline = [s.total_value for s in daily_snapshots]

        user = db.query(User).filter(User.id == member.user_id).first()
        portfolio = (
            db.query(Portfolio).filter(Portfolio.id == member.portfolio_id).first()
        )

        entries.append(
            leagueModels.LeaderboardEntry(
                rank=0,  # assigned after sorting below
                user_id=member.user_id,
                username=user.username,
                portfolio_id=member.portfolio_id,
                portfolio_name=portfolio.name,
                start_value=baseline.total_value,
                current_value=current_value,
                growth_pct=growth_pct,
                sparkline=sparkline,
            )
        )

    # Sort descending by growth_pct and assign ranks
    entries.sort(key=lambda e: e.growth_pct, reverse=True)
    for i, entry in enumerate(entries):
        entry.rank = i + 1

    # Header stats
    growth_values = [e.growth_pct for e in entries]
    top_gain = max(growth_values) if growth_values else Decimal("0")
    avg_growth = (
        (sum(growth_values) / len(growth_values)).quantize(Decimal("0.01"))
        if growth_values
        else Decimal("0")
    )

    days_remaining = None
    if league.end_date:
        delta = (league.end_date - date.today()).days
        days_remaining = max(delta, 0)

    return leagueModels.LeaderboardResponse(
        league=_league_info(league, db),
        top_gain=top_gain,
        avg_growth=avg_growth,
        days_remaining=days_remaining,
        entries=entries,
    )


# -------------------------
# POST /leagues/{league_id}/snapshots  (called by cron job)
# -------------------------
@router.post(
    "/{league_id}/snapshots",
    status_code=201,
    summary="Trigger a snapshot for all members of a league",
    description="Called by a daily cron job. On the league's start_date it writes a 'baseline' "
    "snapshot (write-once). Every subsequent call writes a 'daily' snapshot.",
)
def take_snapshots(
    league_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    if league.created_by != current_user.user_id:
        raise HTTPException(
            status_code=403, detail="Only the league creator can trigger snapshots"
        )

    _refresh_status(league, db)

    if league.status == LeagueStatus.PENDING:
        raise HTTPException(status_code=400, detail="League has not started yet")

    members = db.query(LeagueMember).filter(LeagueMember.league_id == league_id).all()

    written = 0
    for member in members:
        portfolio = (
            db.query(Portfolio).filter(Portfolio.id == member.portfolio_id).first()
        )
        if not portfolio:
            continue

        total_value = _compute_portfolio_value(portfolio, db)

        # Determine snapshot type: baseline if none exists yet, else daily
        existing_baseline = (
            db.query(PortfolioSnapshot)
            .filter(
                PortfolioSnapshot.league_member_id == member.id,
                PortfolioSnapshot.snapshot_type == SnapshotType.BASELINE,
            )
            .first()
        )

        snap_type = (
            SnapshotType.BASELINE if not existing_baseline else SnapshotType.DAILY
        )

        snapshot = PortfolioSnapshot(
            league_member_id=member.id,
            snapshot_type=snap_type,
            total_value=total_value,
        )
        db.add(snapshot)
        written += 1

    db.commit()
    return {"snapshots_written": written}


# -------------------------
# GET /leagues/{league_id}/members/{member_id}/snapshots
# -------------------------
@router.get(
    "/{league_id}/members/{member_id}/snapshots",
    response_model=leagueModels.MemberSnapshotHistory,
    summary="Get snapshot time-series for a single member (race chart data)",
)
def get_member_snapshots(
    league_id: int,
    member_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    member = (
        db.query(LeagueMember)
        .filter(
            LeagueMember.id == member_id,
            LeagueMember.league_id == league_id,
        )
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Member not found in this league")

    snapshots = (
        db.query(PortfolioSnapshot)
        .filter(PortfolioSnapshot.league_member_id == member_id)
        .order_by(PortfolioSnapshot.recorded_at.asc())
        .all()
    )

    user = db.query(User).filter(User.id == member.user_id).first()

    return leagueModels.MemberSnapshotHistory(
        user_id=member.user_id,
        username=user.username,
        portfolio_id=member.portfolio_id,
        snapshots=[
            leagueModels.SnapshotPoint(
                recorded_at=s.recorded_at,
                total_value=s.total_value,
            )
            for s in snapshots
        ],
    )


# -------------------------
# DELETE /leagues/{league_id}
# -------------------------
@router.delete(
    "/{league_id}",
    status_code=204,
    summary="Delete a league",
    description="Permanently deletes a league and all its members and snapshots. Only the creator can do this.",
)
def delete_league(
    league_id: int,
    current_user=Depends(user_from_jwt),
    db: Session = Depends(get_db),
):
    league = db.query(League).filter(League.id == league_id).first()
    if not league:
        raise HTTPException(status_code=404, detail="League not found")

    if league.created_by != current_user.user_id:
        raise HTTPException(
            status_code=403, detail="Only the league creator can delete this league"
        )

    db.delete(league)
    db.commit()
