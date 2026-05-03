from app.models import userModels
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, APIRouter
from datetime import datetime
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    user_from_jwt,
)
import app.schema as schema
from app.database import get_db

router = APIRouter(prefix="/users", tags=["users"])


# Helper method to grab a user
def get_current_active_user(
    db: Session = Depends(get_db),
    token_data=Depends(user_from_jwt),
):
    user = db.query(schema.User).filter(
        schema.User.id == token_data.user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="Account is deactivated")

    return user


@router.post(
    "/create",
    response_model=userModels.UserInfo,
    status_code=201,
    summary="User account creation / signup",
    description="Sets up a user account with specified email address, username, and password. Email address is input validated, and passwords are hashed for storage.",
)
def create_user(user: userModels.UserCreate, db: Session = Depends(get_db)):
    # Hash password for storage
    hashed_pw = hash_password(user.password)

    new_user = schema.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw,
        cash_balance=user.initial_balance,
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

    response = userModels.UserInfo(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        created_at=new_user.created_at,
        cash_balance=new_user.cash_balance,
    )

    return response


@router.get(
    "/uinfo",
    response_model=userModels.UserInfo,
    summary="Return basic information about user.",
    description="Requires valid JWT.",
)
def get_user_info(db: Session = Depends(get_db), user=Depends(get_current_active_user)):
    return userModels.UserInfo(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        cash_balance=user.cash_balance,
    )


@router.post(
    "/login",
    response_model=userModels.TokenResponse,
    summary="User account login",
    description="Attempts to login a user given an identifier and password. Identifier can be username or email. On success, will return a JWT to be used in other requests.",
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
        "user_id": str(user.id),
    }  # subject = user id
    token = create_access_token(token_data)

    return userModels.TokenResponse(access_token=token, token_type="Bearer")


@router.get(
    "/protected",
    response_model=userModels.ProtectedResponse,
    summary="Test JWT validity",
    description='This endpoint is to test sending JWT\'s through headers to verify that a user has permissions. To use, a JWT obtained through /users/login should be sent in the header as "Authorization" : "Bearer <JWT token>". On success, it should then return access granted as well as basic user data.',
)
def protected_route(current_user=Depends(user_from_jwt)):
    return current_user


@router.patch(
    "/update",
    response_model=userModels.UserInfo,
    summary="Update user credentials",
    description="Allows updating username, email, and/or password. Requires JWT. Password change requires current password.",
)
def update_user(
    updates: userModels.UserUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user),
):

    if not any([updates.username, updates.email, updates.new_password]):
        raise HTTPException(status_code=400, detail="No updates provided")
    
    # --- Username update ---
    if updates.username:
        user.username = updates.username

    # --- Email update ---
    if updates.email:
        user.email = updates.email

    # --- Password update ---
    if updates.new_password:
        if not updates.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password required to set a new password",
            )

        if not verify_password(updates.current_password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect current password")

        user.password_hash = hash_password(updates.new_password)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError as e:
        db.rollback()
        if "username" in str(e.orig):
            raise HTTPException(status_code=400, detail="Username already taken")
        elif "email" in str(e.orig):
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail="Update failed due to constraint violation")

    return userModels.UserInfo(
        id=user.id,
        username=user.username,
        email=user.email,
        created_at=user.created_at,
        cash_balance=user.cash_balance,
    )
    
    
@router.delete(
    "/delete",
    summary="Delete user account",
    description="Deletes the given user. Requires resumbission of password.",
)
def delete_user(
    request: userModels.UserDeleteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    if not verify_password(request.password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    current_user.deleted_at = datetime.utcnow()

    db.commit()
    
    return {"message": "User deleted successfully"}