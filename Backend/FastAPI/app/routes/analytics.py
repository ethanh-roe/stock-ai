from app.models import portfolioModels
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter, status
from app.security import user_from_jwt
from app.schema import Portfolio, Position, Ticker, User
from app.database import get_db

router = APIRouter(prefix="/ai", tags=["ai"])
