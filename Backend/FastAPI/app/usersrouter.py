import app.models as models
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import hash_password, verify_password, create_access_token
import app.schema as schema
from app.database import get_db

router = APIRouter()


@router.post(
    "/users/create/",
    response_model=models.UserCreateResponse,
    status_code=201,
    summary="User account creation / signup",
    description="""
    Sets up a user account with specified email address, username, and password. 
    Email address is input validated, and passwords are hashed for storage.
    """
)
def create_user(user: models.UserCreate, db: Session = Depends(get_db)):
    # Hash password for storage
    hashed_pw = hash_password(user.password)

    new_user = schema.User(
        username=user.username, email=user.email, password_hash=hashed_pw
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError as e:
        db.rollback()
        # Determine if username or email duplicate
        # May need to return to this; I'm guessing there is a better way to do this
        if "username" in str(e.orig):
            raise HTTPException(status_code=400, detail="Username already taken")
        elif "email" in str(e.orig):
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Duplicate entry")

    response = models.UserCreateResponse(
        id=new_user.user_id, username=new_user.username, email=new_user.email
    )

    return response


@router.post("/users/login", response_model=models.TokenResponse, summary="User account login",
             description="""
             Attempts to login a user given an identifier and password.
             Identifier can be username or email.
             """)
def login(request: models.UserLogin, db: Session = Depends(get_db)):
    # 1. Look up the user
    user = (
        db.query(schema.User)
        .filter(
            or_(
                schema.User.username == request.identifier,
                schema.User.email == request.identifier,
            )
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 2. Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 3. Create JWT token
    token_data = {"sub": str(user.user_id)}  # subject = user id
    token = create_access_token(token_data)

    return {"access_token": token, "token_type": "bearer"}
