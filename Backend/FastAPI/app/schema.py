from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from typing import Optional


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)


class Portfolio(Base):
    __tablename__ = "portfolios"

    portfolio_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    name = Column(String(255), unique=True, nullable=False)
    creation_date = Column(TIMESTAMP, nullable=False, server_default=func.now())


# Are we storing stock data individually? Seems like unnecessary upkeep.
# I think it would be better to just store ticker as a stock id for trades,
# without needing to store ticker information (prices, name, industry, etc) locally. 
# However, this would require reworking the database; I'm just leaving it alone for now.
class Stock(Base):
    __tablename__ = "stocks"

    stock_id = Column(Integer, primary_key=True)
    ticker = Column(String(10), unique=True)
    company = Column(String(255))


class Trade(Base):
    __tablename__ = "trades"

    trade_id = Column(Integer, primary_key=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.portfolio_id"))
    stock_id = Column(Integer, ForeignKey("stocks.stock_id"))
    quantity = Column(DECIMAL(10, 2))
    price_per_share = Column(DECIMAL(10, 2))
    trade_date = Column(TIMESTAMP)
