import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Load environment variables from .env file
load_dotenv()


# Database URL comes from .env
DATABASE_URL = os.getenv("DATABASE_URL")


# Create database engine
engine = create_engine(DATABASE_URL)


# Create database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base class for database models
Base = declarative_base()


# Dependency/helper for database sessions
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()