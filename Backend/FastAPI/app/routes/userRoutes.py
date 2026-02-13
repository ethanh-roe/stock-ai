from app.models import userModels
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    user_from_jwt,
)
import app.schema as schema
from app.database import get_db

router = APIRouter()

@router.post(
    "/users/create/",
    response_model=userModels.UserInfoResponse,
    status_code=201,
    summary="User account creation / signup",
    description="""
    Sets up a user account with specified email address, username, and password. 
    Email address is input validated, and passwords are hashed for storage.
    """,
)
def create_user(user: userModels.UserCreate, db: Session = Depends(get_db)):
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

    response = userModels.UserInfoResponse(id=new_user.user_id, username=new_user.username)

    return response


@router.post(
    "/users/login",
    response_model=userModels.TokenResponse,
    summary="User account login",
    description="""
             Attempts to login a user given an identifier and password.
             Identifier can be username or email.
             
             On success, will return a JWT to be used in other requests.
             """,
)
def login(request: userModels.UserLogin, db: Session = Depends(get_db)):
    # 1. Look up the user
    user = (
        db.query(schema.User)
        .filter(
            or_(
                schema.User.username == request.username,
                schema.User.email == request.username,
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
    token_data = {
        "sub": user.username,
        "user_id": str(user.user_id),
    }  # subject = user id
    token = create_access_token(token_data)

    return {"access_token": token, "token_type": "bearer"}


@router.get(
    "/users/protected",
    summary="Test JWT validity",
    description="""
            This endpoint is to test sending JWT's through headers to verify that a user has permissions.
            To use, a JWT obtained through /users/login should be sent in the header as
            "Authorization" : "Bearer <JWT token>"
            
            On success, it should then return access granted as well as basic user data.
            """,
)
def protected_route(current_user=Depends(user_from_jwt)):
    return {"message": "Access granted", "user": current_user}
