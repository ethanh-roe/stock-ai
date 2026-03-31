from app.database import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    ForeignKey,
    Enum,
    Numeric,
    Index,
    TIMESTAMP,
    Date,
    UniqueConstraint,
    Text,
)
import enum
from typing import List


# Trade direction enum
class TradeType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class LeagueStatus(str, enum.Enum):
    PENDING = "pending"   # before start_date, joinable
    ACTIVE = "active"     # started, locked
    ENDED = "ended"


class SnapshotType(str, enum.Enum):
    BASELINE = "baseline"  # locked at start_date, write-once
    DAILY = "daily"        # periodic check-ins for race chart


class MessageType(str, enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"


# -------------------------
# User
# -------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    cash_balance = Column(Numeric(15, 2), nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    portfolios: Mapped[List["Portfolio"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    league_memberships: Mapped[List["LeagueMember"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    created_leagues: Mapped[List["League"]] = relationship(
        back_populates="creator",
        cascade="all, delete-orphan",
    )


# -------------------------
# Portfolio
# -------------------------
class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(100), nullable=False)
    cash_balance = Column(Numeric(15, 2), nullable=False, default=0)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="portfolios")
    positions: Mapped[List["Position"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    trades: Mapped[List["Trade"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    league_memberships: Mapped[List["LeagueMember"]] = relationship(
        back_populates="portfolio",
    )


# -------------------------
# Ticker (Static Asset Info)
# -------------------------
class Ticker(Base):
    __tablename__ = "tickers"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    symbol = Column(String(10), unique=True, nullable=False)
    name = Column(String(100))

    trades: Mapped[List["Trade"]] = relationship(back_populates="ticker")
    positions: Mapped[List["Position"]] = relationship(back_populates="ticker")


# -------------------------
# Position (Current Holdings)
# -------------------------
class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
    )
    ticker_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("tickers.id", ondelete="CASCADE"),
        nullable=False,
    )
    quantity = Column(Numeric(15, 6), nullable=False)
    avg_cost_basis = Column(Numeric(15, 4), nullable=False)

    __table_args__ = (
        UniqueConstraint("portfolio_id", "ticker_id", name="uix_portfolio_ticker"),
        Index("idx_positions_portfolio", "portfolio_id"),
        Index("idx_positions_ticker", "ticker_id"),
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="positions")
    ticker: Mapped["Ticker"] = relationship(back_populates="positions")


# -------------------------
# Trade (Transaction Log)
# -------------------------
class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
    )
    ticker_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("tickers.id", ondelete="CASCADE"),
        nullable=False,
    )
    trade_type = Column(Enum(TradeType), nullable=False)
    quantity = Column(Numeric(15, 6), nullable=False)
    price = Column(Numeric(15, 4), nullable=False)
    realized_pnl = Column(Numeric(15, 4), nullable=True)
    executed_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_trades_portfolio", "portfolio_id"),
        Index("idx_trades_ticker", "ticker_id"),
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="trades")
    ticker: Mapped["Ticker"] = relationship(back_populates="trades")


# -------------------------
# Conversation
# -------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=True)
    last_response_id = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=True, onupdate=func.now())

    messages: Mapped[List["Message"]] = relationship(back_populates="conversation")


# -------------------------
# Message
# -------------------------
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    conversation_id = Column(BigInteger, ForeignKey("conversations.id"), nullable=False)
    role = Column(Enum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")


# -------------------------
# League
# -------------------------
class League(Base):
    __tablename__ = "leagues"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    invite_code = Column(String(16), unique=True, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(Enum(LeagueStatus), nullable=False, default=LeagueStatus.PENDING)
    created_by: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    creator: Mapped["User"] = relationship(back_populates="created_leagues")
    members: Mapped[List["LeagueMember"]] = relationship(
        back_populates="league",
        cascade="all, delete-orphan",
    )


# -------------------------
# LeagueMember  (user + portfolio entered into a league)
# -------------------------
class LeagueMember(Base):
    __tablename__ = "league_members"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    league_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("leagues.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    portfolio_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("portfolios.id", ondelete="CASCADE"),
        nullable=False,
    )
    joined_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    __table_args__ = (
        # one portfolio entry per user per league
        UniqueConstraint("league_id", "user_id", name="uix_league_user"),
        Index("idx_league_members_league", "league_id"),
        Index("idx_league_members_user", "user_id"),
    )

    league: Mapped["League"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="league_memberships")
    portfolio: Mapped["Portfolio"] = relationship(back_populates="league_memberships")
    snapshots: Mapped[List["PortfolioSnapshot"]] = relationship(
        back_populates="league_member",
        cascade="all, delete-orphan",
    )


# -------------------------
# PortfolioSnapshot  (pre-computed value at a point in time)
# -------------------------
class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    league_member_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("league_members.id", ondelete="CASCADE"),
        nullable=False,
    )
    snapshot_type = Column(Enum(SnapshotType), nullable=False)
    total_value = Column(Numeric(15, 2), nullable=False)
    recorded_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_snapshots_member", "league_member_id"),
        Index("idx_snapshots_member_type", "league_member_id", "snapshot_type"),
    )

    league_member: Mapped["LeagueMember"] = relationship(back_populates="snapshots")
