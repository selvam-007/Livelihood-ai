import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.progress import AuditLog

logger = logging.getLogger("livelihood_ai.audit")


def utc_now():
    return datetime.now(timezone.utc)


def log_audit_event(
    db: Session,
    actor_id: Optional[int],
    actor_role: str,
    action: str,
    target_user_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """
    Log an administrative, agent, or provider action on candidate data.
    Ensures regulatory compliance, DPDP Act accountability, and security audit trails.
    """
    try:
        audit_entry = AuditLog(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            target_user_id=target_user_id,
            details=details or {},
            ip_address=ip_address,
            timestamp=utc_now()
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        logger.info(f"AUDIT: [{actor_role}] user {actor_id} performed '{action}' on target user {target_user_id}")
        return audit_entry
    except Exception as e:
        logger.error(f"Failed to write audit log entry: {e}")
        db.rollback()
        return None
