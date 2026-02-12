import app.models as models
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import hash_password, verify_password, create_access_token
import app.schema as schema
from app.database import get_db