import os
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

import yfinance as yf
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema import (
    Portfolio,
    Position,
    PortfolioSnapshot,
    PositionSnapshot,
    SnapshotType,
    Ticker,
)

load_dotenv()

router = APIRouter(prefix="/internal", tags=["internal"])

_CRON_SECRET = os.getenv("CRON_SECRET", "")


def _verify_cron(x_cron_secret: Optional[str] = Header(None)):
    if not _CRON_SECRET or x_cron_secret != _CRON_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@router.post(
    "/snapshots/daily",
    summary="Daily snapshot job",
    description=(
        "Triggered by the GitLab scheduled pipeline at market close (21:00 UTC, weekdays). "
        "Fetches current prices via yfinance and writes one PortfolioSnapshot + one "
        "PositionSnapshot per position for every non-deleted portfolio. "
        "Idempotent — skips portfolios that already have a snapshot recorded today."
    ),
    dependencies=[Depends(_verify_cron)],
)
def run_daily_snapshots(db: Session = Depends(get_db)):
    now = datetime.utcnow().replace(hour=21, minute=0, second=0, microsecond=0)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    portfolios = db.query(Portfolio).filter(Portfolio.deleted_at.is_(None)).all()

    # Collect all unique ticker symbols across all portfolios so we can batch
    # the yfinance call instead of hitting the API once per portfolio.
    all_symbols: set[str] = set()
    portfolio_positions: dict[int, list[tuple[Position, Ticker]]] = {}

    for portfolio in portfolios:
        positions = (
            db.query(Position, Ticker)
            .join(Ticker, Position.ticker_id == Ticker.id)
            .filter(Position.portfolio_id == portfolio.id)
            .all()
        )
        if positions:
            portfolio_positions[portfolio.id] = positions
            for _, ticker in positions:
                all_symbols.add(ticker.symbol)

    # Batch price fetch
    price_map: dict[str, Decimal] = {}
    if all_symbols:
        yf_tickers = yf.Tickers(" ".join(all_symbols))
        for symbol in all_symbols:
            try:
                price = yf_tickers.tickers[symbol].info["regularMarketPrice"]
                price_map[symbol] = Decimal(str(price))
            except Exception:
                price_map[symbol] = None

    created = 0
    skipped = 0
    missing_price = 0

    for portfolio in portfolios:
        positions = portfolio_positions.get(portfolio.id)
        if not positions:
            skipped += 1
            continue

        # Idempotency check — skip if a snapshot was already recorded today
        existing = (
            db.query(PortfolioSnapshot)
            .filter(
                PortfolioSnapshot.portfolio_id == portfolio.id,
                PortfolioSnapshot.recorded_at >= today_start,
            )
            .first()
        )
        if existing:
            skipped += 1
            continue

        # Compute total market value of all positions
        position_values: dict[str, Decimal] = {}
        for pos, ticker in positions:
            price = price_map.get(ticker.symbol)
            if price is None:
                missing_price += 1
                continue
            position_values[ticker.symbol] = price * pos.quantity

        cash = portfolio.cash_balance or Decimal("0")
        total_value = sum(position_values.values()) + cash

        snap = PortfolioSnapshot(
            portfolio_id=portfolio.id,
            snapshot_type=SnapshotType.DAILY,
            total_value=total_value,
            cash_balance=cash,
            recorded_at=now,
        )
        db.add(snap)
        db.flush()

        for pos, ticker in positions:
            mv = position_values.get(ticker.symbol)
            if mv is None:
                continue
            db.add(PositionSnapshot(
                portfolio_snapshot_id=snap.id,
                ticker_id=ticker.id,
                market_value=mv,
                recorded_at=now,
            ))

        created += 1

    db.commit()

    return {
        "status": "ok",
        "snapshots_created": created,
        "portfolios_skipped": skipped,
        "positions_missing_price": missing_price,
        "recorded_at": now.isoformat(),
    }
