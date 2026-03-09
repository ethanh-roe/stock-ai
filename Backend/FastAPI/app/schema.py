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
    UniqueConstraint,
    Text,
)
import enum
from typing import List


# Trade direction enum
class TradeType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class MessageType(str, enum.Enum):
    PROMPT = "PROMPT"
    RESPONSE = "RESPONSE"


# -------------------------
# User
# -------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # Simulated funding pool
    cash_balance = Column(Numeric(15, 2), nullable=False, default=0)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    portfolios: Mapped[List["Portfolio"]] = relationship(
        back_populates="user",
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

    # Cash allocated to this portfolio
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

    # Core financial data
    quantity = Column(Numeric(15, 6), nullable=False)
    avg_cost_basis = Column(Numeric(15, 4), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "portfolio_id",
            "ticker_id",
            name="uix_portfolio_ticker",
        ),
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

    # Optional but VERY useful
    realized_pnl = Column(Numeric(15, 4), nullable=True)

    executed_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_trades_portfolio", "portfolio_id"),
        Index("idx_trades_ticker", "ticker_id"),
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="trades")
    ticker: Mapped["Ticker"] = relationship(back_populates="trades")


# -------------------------
# Conversations (group chat sessions)
# -------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)

    title = Column(String(100), nullable=True)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, onupdate=func.now())

    messages: Mapped[List["Message"]] = relationship(back_populates="conversation")


# -------------------------
# Messages (individual chat messages)
# -------------------------
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = Column(BigInteger, primary_key=True)

    conversation_id = Column(BigInteger, ForeignKey("conversations.id"), nullable=False)

    role = Column(Enum(MessageType), nullable=False)
    content = Column(Text, nullable=False)

    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
