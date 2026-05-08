"""
database.py - SQLAlchemy Database Configuration
================================================
This module sets up the SQLAlchemy database connection for the Diabetes EMR.

Architecture Overview:
  - SQLite is used for zero-config local development (file: ./diabetes_emr.db)
  - SQLAlchemy ORM abstracts raw SQL; swap databases by changing DATABASE_URL
  - SessionLocal creates one DB session per API request (dependency-injected)
  - Base is the parent class all ORM models inherit from

Switching databases (no other code changes needed):
  - PostgreSQL: DATABASE_URL = "postgresql://user:pass@localhost/diabetes_emr"
    pip install psycopg2-binary
  - MySQL:      DATABASE_URL = "mysql+pymysql://user:pass@localhost/diabetes_emr"
    pip install pymysql
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ── Database URL ──────────────────────────────────────────────────────────────
# Read from environment variable so secrets stay out of source code.
# Falls back to a local SQLite file for development convenience.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./diabetes_emr.db")

# ── Engine ────────────────────────────────────────────────────────────────────
# The engine is SQLAlchemy's core connection object.
#
# connect_args={"check_same_thread": False}
#   SQLite only allows the creating thread to use a connection by default.
#   FastAPI serves requests on multiple threads, so we disable this restriction.
#   SQLAlchemy's connection pool makes multi-thread access safe.
#   This arg is IGNORED (and should be removed) for PostgreSQL/MySQL.
#
# echo=False  →  set to True during development to log every SQL statement
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

# ── Session Factory ───────────────────────────────────────────────────────────
# SessionLocal is a class factory; calling SessionLocal() returns a new session.
# autocommit=False → we control when changes are committed (explicit is safer)
# autoflush=False  → prevents SQLAlchemy from auto-writing to DB mid-session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Declarative Base ──────────────────────────────────────────────────────────
# Base holds the metadata registry that SQLAlchemy uses to:
#   1. Map Python classes → database tables
#   2. Generate CREATE TABLE DDL via Base.metadata.create_all(engine)
Base = declarative_base()


# ── FastAPI Dependency ────────────────────────────────────────────────────────
def get_db():
    """
    Yield a SQLAlchemy database session, closing it after the request.

    FastAPI's dependency injection system calls this function for every
    route that declares `db: Session = Depends(get_db)`.

    The try/finally ensures the session is ALWAYS closed, preventing
    connection leaks even when an exception occurs inside the route.

    Example usage in a route:
        @router.get("/patients")
        def list_patients(db: Session = Depends(get_db)):
            return db.query(Patient).all()
    """
    db = SessionLocal()
    try:
        yield db          # The route handler receives this active session
    finally:
        db.close()        # Runs after the response is sent, success or failure
