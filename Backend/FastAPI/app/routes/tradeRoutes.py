from app.models import portfolioModels
from typing import List
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import user_from_jwt
import app.schema as schema
from app.database import get_db


router = APIRouter(prefix="/trades", tags=["trades"])


# I'm getting there - Andrew