from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, TIMESTAMP
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(255), unique=True)

class Portfolio(Base):
    __tablename__ = "portfolios"

    portfolio_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))

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
    quantity = Column(DECIMAL(10,2))
    price_per_share = Column(DECIMAL(10,2))
    trade_date = Column(TIMESTAMP)
