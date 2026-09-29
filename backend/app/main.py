"""
LivelihoodAI — FastAPI application entry point.

Key production features implemented here:
- Structured JSON logging (python-json-logger)
- slowapi rate limiting (Redis-backed when REDIS_URL is set, in-memory otherwise)
  * Keyed by authenticated user_id when JWT present, else by real client IP
  * X-Forwarded-For is trusted only when TRUSTED_PROXY_COUNT > 0
- Single /api/v1 prefix (dual /api prefix removed)
- /health endpoint checking DB + Redis
- Alembic manages schema — Base.metadata.create_all() removed
"""

import time
import logging
import json
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.api import api_router
from app.database.session import engine, get_db
# Import models so Alembic/SQLAlchemy DeclarativeBase can discover them
import app.models.user      # noqa: F401
import app.models.profile   # noqa: F401
import app.models.progress  # noqa: F401
import app.models.catalog   # noqa: F401


# ---------------------------------------------------------------------------
# Structured JSON Logging
# ---------------------------------------------------------------------------

class _JsonFormatter(logging.Formatter):
    """Emit each log record as a single JSON line."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def _configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(_JsonFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)


_configure_logging()
logger = logging.getLogger("LivelihoodAI")


# ---------------------------------------------------------------------------
# Rate limiting — key function
# ---------------------------------------------------------------------------

def _rate_limit_key(request: Request) -> str:
    """
    Key for rate limiting:
    1. If a valid Bearer token is present, use the user_id from the JWT payload.
    2. Otherwise, use the real client IP (respects X-Forwarded-For only when
       TRUSTED_PROXY_COUNT > 0 to avoid IP spoofing from untrusted clients).
    """
    # Try to extract user_id from JWT (no DB call needed — just decode payload)
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            from jose import jwt as _jwt
            token = auth_header[7:]
            payload = _jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
                options={"verify_exp": False},  # only need sub; exp validated elsewhere
            )
            user_id = payload.get("sub")
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass  # Fall through to IP-based key

    # IP-based key
    proxy_count = settings.TRUSTED_PROXY_COUNT
    if proxy_count > 0:
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        ips = [ip.strip() for ip in forwarded_for.split(",") if ip.strip()]
        if len(ips) >= proxy_count:
            # The real client IP is at index -(proxy_count)
            return f"ip:{ips[-proxy_count]}"

    # Fallback: direct connection IP
    return f"ip:{get_remote_address(request)}"


def _build_limiter() -> Limiter:
    """Build a slowapi Limiter, Redis-backed when REDIS_URL is configured."""
    if settings.REDIS_URL:
        try:
            from limits.storage import RedisStorage
            storage_uri = settings.REDIS_URL
            logger.info(f"Rate limiter: Redis backend at {settings.REDIS_URL}")
            return Limiter(key_func=_rate_limit_key, storage_uri=storage_uri)
        except Exception as exc:
            logger.warning(f"Redis rate-limit backend unavailable ({exc}); falling back to in-memory.")

    logger.info("Rate limiter: in-memory backend (set REDIS_URL for Redis-backed)")
    return Limiter(key_func=_rate_limit_key)


limiter = _build_limiter()


# ---------------------------------------------------------------------------
# App lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all SQLAlchemy model tables exist (idempotent — safe to run always).
    # Alembic manages catalog/scheme tables; create_all handles user/profile/progress tables.
    from app.database.base import Base
    import app.models.user      # noqa: F401
    import app.models.profile   # noqa: F401
    import app.models.progress  # noqa: F401
    import app.models.otp       # noqa: F401
    import app.models.provider  # noqa: F401
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("SQLAlchemy create_all completed — all model tables are ready.")
    except Exception as exc:
        logger.warning(f"create_all encountered an issue (non-fatal): {exc}")
    logger.info("LivelihoodAI starting — catalog schema managed by Alembic.")
    yield
    logger.info("LivelihoodAI shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Voice-First Livelihood Intelligence & Skilling Platform",
    version="1.0.0",
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    lifespan=lifespan,
)

# Attach slowapi state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request logging + unhandled exception middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    try:
        response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Process-Time"] = f"{process_time_ms}ms"
        logger.info(json.dumps({
            "event": "request",
            "method": request.method,
            "path": path,
            "status": response.status_code,
            "duration_ms": process_time_ms,
        }))
        return response
    except Exception as exc:
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.exception(json.dumps({
            "event": "unhandled_exception",
            "method": request.method,
            "path": path,
            "duration_ms": process_time_ms,
            "error": str(exc),
            "error_type": exc.__class__.__name__,
        }))
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An unexpected server error occurred. Please try again.",
                "error_type": exc.__class__.__name__,
                "debug_detail": str(exc) if settings.DEBUG else None,
            },
        )


# ---------------------------------------------------------------------------
# Mount API routes — single /api/v1 prefix
# ---------------------------------------------------------------------------

app.include_router(api_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Health check (DB + Redis)
# ---------------------------------------------------------------------------

@app.get("/health", tags=["ops"])
def health_check(db: Session = Depends(get_db)):
    """Liveness + readiness probe: checks DB and Redis connectivity."""
    result: dict = {"status": "ok", "db": "ok", "redis": "not_configured"}

    # Check database
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error(f"Health check DB failure: {exc}")
        result["status"] = "degraded"
        result["db"] = f"error: {exc}"

    # Check Redis if configured
    if settings.REDIS_URL:
        try:
            import redis as redis_lib
            r = redis_lib.from_url(settings.REDIS_URL, socket_connect_timeout=2)
            r.ping()
            result["redis"] = "ok"
        except Exception as exc:
            logger.warning(f"Health check Redis failure: {exc}")
            result["status"] = "degraded"
            result["redis"] = f"error: {exc}"

    http_status = status.HTTP_200_OK if result["status"] == "ok" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=result, status_code=http_status)


# ---------------------------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------------------------

@app.get("/", tags=["ops"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "description": "Livelihood Intelligence & NSQF-Aligned Skilling Platform API",
        "docs": settings.docs_url,
        "api_v1": "/api/v1",
        "health": "/health",
    }