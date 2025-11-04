# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session, declarative_base
from app.core.config import settings

# For dev/prod simple sync usage
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)

# Use sessionmaker (autocommit=False, autoflush=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

# Base for models
Base = declarative_base()

# Dependency to get DB session in FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
