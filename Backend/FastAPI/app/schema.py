from app.database import Base
from sqlalchemy.sql import func
import enum
from typing import List
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    ForeignKey,
    Enum,
    Numeric,
    Index,
    TIMESTAMP,
)
from sqlalchemy.orm import mapped_column, relationship, Mapped
from datetime import datetime


# To easily differentiate trades
class TradeType(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    cash_balance = Column(Numeric(15, 2), default=0)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    # Parent relationship to portfolios, trades
    portfolios: Mapped[List["Portfolio"]] = relationship(back_populates="user")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id"), nullable=False
    )
    name = Column(String(100))
    cash_balance = Column(Numeric(15, 2), default=0)  # Loose cash within portfolio
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    # child relationship to User
    user: Mapped["User"] = relationship(back_populates="portfolios")

    # parent relationship to Asset, Trade
    assets: Mapped[List["Asset"]] = relationship(back_populates="portfolio")
    trades: Mapped[List["Trade"]] = relationship(back_populates="portfolio")


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = Column(BigInteger, primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("portfolios.id"), nullable=False
    )
    symbol = Column(String(10), unique=True, nullable=False)
    name = Column(String(100))

    # Child relationship to Portfolio
    portfolio: Mapped["Portfolio"] = relationship(back_populates="assets")

    # parent relationship to trades
    trades: Mapped[List["Trade"]] = relationship(back_populates="asset")


class Trade(Base):
    __tablename__ = "trades"

    id = Column(BigInteger, primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("portfolios.id"), nullable=False
    )
    asset_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assets.id"), nullable=False
    )

    trade_type = Column(Enum(TradeType), nullable=False)
    quantity = Column(Numeric(15, 6), nullable=False)
    price = Column(Numeric(15, 2), nullable=False)
    executed_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

    __table_args__ = (
        Index("idx_trades_portfolio", "portfolio_id"),
        Index("idx_trades_asset", "asset_id"),
    )

    # Child relationship to portfolio, asset
    portfolio: Mapped["Portfolio"] = relationship(back_populates="trades")
    asset: Mapped["Asset"] = relationship(back_populates="trades")
