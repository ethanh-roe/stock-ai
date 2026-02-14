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
        socket.create_connection((host, port), timeout=1)
        return True
    except Exception:
        return False

# Attempts to resolve host for given running environment, be that Podman, Docker, or otherwise.
def resolve_db_host():
    candidates = [
        "host.containers.internal",  # Podman
        "host.docker.internal",      # Docker
        "localhost"                  # fallback
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
DB_HOST = os.getenv("DB_HOST") or resolve_db_host()
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = (
    f"mariadb+pymysql://"
    f"{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

print("\nDATABASE_URL =", DATABASE_URL, "\n") # For debugging

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
