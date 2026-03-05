from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
import socket

# Load environment variables
load_dotenv()


# Tests if connection to host:3306 can be made.
# Used to help resolve the correct host, depending on run environment.
def can_connect(host, port=3306):
    try:
        print(f"\n Attempting {host}\n", host)
        socket.create_connection((host, port), timeout=1)
        print(f"\n {host}\n Success", host)
        return True
    except Exception:
        print(f"\n {host} Failed\n", host)
        return False


# Attempts to resolve host for given running environment, be that Podman, Docker, or otherwise.
def resolve_db_host():
    candidates = [
        "coms-4020-029.class.las.iastate.edu",  # ISU server
        "host.containers.internal",  # Podman external local
        "host.docker.internal",  # Docker external local
        "localhost",  # fallback
    ]

    for host in candidates:
        try:
            socket.gethostbyname(host)
            if can_connect(host):
                return host
            continue
        except socket.error:
            continue

    raise RuntimeError("No reachable DB host found")


DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = resolve_db_host()
# DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = (
    f"mariadb+pymysql://" f"{DB_USER}:{DB_PASSWORD}" f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# DATABASE_URL = "mariadb+pymysql://dev:ug_hf_03?!@coms-4020-029.class.las.iastate.edu:3306/testing"

# print("\nDATABASE_URL =", DATABASE_URL, "\n") # For debugging

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
