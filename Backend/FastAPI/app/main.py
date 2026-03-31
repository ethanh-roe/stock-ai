from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database import get_db, create_tables
import app.schema as schema
from app.routes import stockRoutes, userRoutes, wsRoutes, portfolioRoutes, tradeRoutes, chatRoutes, analysisRoutes, leagueRoutes
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
app.include_router(chatRoutes.router)
app.include_router(analysisRoutes.router)
app.include_router(leagueRoutes.router)
create_tables() 

origins = [
    "http://localhost:80",
    "http://127.0.0.1:80",
    "http://coms-4020-029.class.las.iastate.edu:80",
    "http://localhost:443",
    "http://127.0.0.1:443",
    "http://coms-4020-029.class.las.iastate.edu:443",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://coms-4020-029.class.las.iastate.edu:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://coms-4020-029.class.las.iastate.edu:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://coms-4020-029.class.las.iastate.edu:5174",   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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

# This is a line to test that backend changes trigger the BE deploy pipeline. Please remove if still here.
