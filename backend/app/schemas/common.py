from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel, Field


class APIResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    database_connected: bool
    timestamp: datetime
