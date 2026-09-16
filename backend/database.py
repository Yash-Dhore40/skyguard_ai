import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Default to SQLite for local development; switch to PostgreSQL in production via DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./skyguard.db")

# Handle Render / Heroku postgres:// -> postgresql:// prefix compatibility
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency that yields a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
