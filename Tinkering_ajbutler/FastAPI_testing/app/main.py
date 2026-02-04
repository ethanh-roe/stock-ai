from fastapi import FastAPI
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
import app.models as models

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title="FastAPI Backend Test")

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.get("/testing")
def read_root():
    return {"message": "Testing if this is how it works"}

@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    count = db.query(models.User).count()
    return {"users_in_db": count}

@app.post("/create_user/")
def create_user(username: str, email: str, db: Session = Depends(get_db)):
    user = models.User(username=username, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
