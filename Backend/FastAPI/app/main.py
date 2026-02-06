from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import engine, SessionLocal, Base
import app.models as models
import app.schema as schema
from app.security import hash_password, verify_password, create_access_token
from pydantic import BaseModel


Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="Stock Trading REST API")

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    count = db.query(schema.User).count()
    return {"users_in_db": count}

@app.post("/users/create_simple/")
def create_user(username: str, email: str, db: Session = Depends(get_db)):
    new_user = schema.User(username=username, email=email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    response = models.UserCreateResponse(id=new_user.user_id, username=new_user.username, email=new_user.email)
    
    return response

@app.post("/users/create/", response_model=models.UserCreateResponse, status_code=201)
def create_user(user: models.UserCreate,  db: Session = Depends(get_db)):
    # Hash password for storage
    hashed_pw = hash_password(user.password)

    new_user = schema.User(username=user.username, email=user.email, password_hash=hashed_pw)

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
    
    response = models.UserCreateResponse(id=new_user.user_id, username=new_user.username, email=new_user.email)
    
    return response


@app.post("/users/login", response_model=models.TokenResponse)
def login(request: models.UserLogin, db: Session = Depends(get_db)):
    # 1. Look up the user
    user = db.query(schema.User).filter(schema.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 2. Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # 3. Create JWT token
    token_data = {"sub": str(user.user_id)}  # subject = user id
    token = create_access_token(token_data)

    return {"access_token": token, "token_type": "bearer"}
