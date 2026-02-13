from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import get_db
import app.schema as schema
from app.routes import stockRoutes, userRoutes, portfolioRoutes
from app.routes import stockRoutes, userRoutes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="STOCK-AI API",
    description="""
              This is our API.
              Work in progress, but there should eventually be endpoints for users, portfolios, positions, etc.
              
              """,
    version="0.0.2",
)

# Include other routers here. We'll do this to keep things a little more organized.
app.include_router(userRoutes.router)
app.include_router(portfolioRoutes.router)
app.include_router(stockRoutes.router)

origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:5174", 
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,
    allow_methods=["*"],             
    allow_headers=["*"],          
)

@app.get(
    "/",
    summary="root request",
    description="Simple request to verify that API is indeed running.",
)
def read_root():
    return {"message": "AI-Integrated Stock Trading Platform API says hello"}


@app.get(
    "/num_users",
    summary="Grabs number of users listed in database.",
    description="""
         Establishes database connection, and make simple query to get the number of stored users.
         Largely exists as a way to test that the database connection is working correctly.
         """,
)
def db_test(db: Session = Depends(get_db)):
    count = db.query(schema.User).count()
    return {"users_in_db": count}
