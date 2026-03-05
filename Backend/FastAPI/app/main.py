from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import get_db, create_tables
import app.schema as schema
from app.routes import stockRoutes, userRoutes, wsRoutes, portfolioRoutes, tradeRoutes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="STOCK-AI API",
    description="This is the API for Stock-AI, an AI-integrated stock trading platform. Currently a work in progress; endpoints & functionality are subject to change.",
    version="0.1.1",
)

# Include other routers here. We'll do this to keep things a little more organized.
app.include_router(userRoutes.router)
app.include_router(portfolioRoutes.router)
app.include_router(stockRoutes.router)
app.include_router(wsRoutes.router)
app.include_router(tradeRoutes.router)
create_tables()  # Create tables, if needed

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
    description="Establishes database connection, and make simple query to get the number of stored users. Largely exists as a way to test that the database connection is working correctly.",
)
def db_test(db: Session = Depends(get_db)):
    count = db.query(schema.User).count()
    return {"users_in_db": count}
