from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool, NullPool

from app.config import settings


def _build_engine():
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        # SQLite: single file, no pooling needed
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=False,
        )
    else:
        # PostgreSQL (or other RDBMS): use connection pooling
        return create_engine(
            url,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,   # recycles stale connections automatically
            pool_recycle=300,     # recycle connections every 5 min
            echo=False,
        )


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing a transactional database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()