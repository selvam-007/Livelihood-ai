from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database.session import get_db
from app.schemas.common import HealthCheckResponse, APIResponse

router = APIRouter(tags=["Health & System"])


@router.get("/health", response_model=APIResponse)
def get_system_health(db: Session = Depends(get_db)):
    """Health check endpoint checking application and database connection."""
    db_connected = False
    try:
        # Execute lightweight ping query
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    payload = HealthCheckResponse(
        status="healthy" if db_connected else "degraded",
        app_name=settings.PROJECT_NAME,
        version="1.0.0",
        database_connected=db_connected,
        timestamp=datetime.now(timezone.utc)
    )

    return APIResponse(
        success=True,
        message="System status verified",
        data=payload.model_dump()
    )
