from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import get_db
import app.schema as schema
from app.usersrouter import router as users_router

app = FastAPI(
    title="AI-Integrated Stock Trading Platform API",
    description="""
              This is a description for the API.
              For now, it only has the following functionality:
              - Create user accounts
              - Log into user accounts
              
              """,
    version="0.0.1",
)
# Include other routers here. We'll do this to keep things a little more organized.
app.include_router(users_router)


@app.get(
    "/",
    summary="root request",
    description="Simple request to verify that API is indeed running.",
)
def read_root():
    return {"message": "AI-Integrated Stock Trading Platform API says hello"}


@app.get("/num_users", summary="Grabs number of users listed in database.",
         description="""
         Establishes database connection, and make simple query to get the number of stored users.
         Largely exists as a way to test that the database connection is working correctly.
         """)
def db_test(db: Session = Depends(get_db)):
    count = db.query(schema.User).count()
    return {"users_in_db": count}
