"""
Database Models for Candidate Progress Tracking, Compliance Consent, Audit Logs, and User Feedback.
Supports candidate journey continuity, module completion, RPL progression, and regulatory compliance.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class CandidateProgress(Base):
    __tablename__ = "candidate_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    qp_code = Column(String(50), index=True, nullable=False)
    qualification_name = Column(String(255), nullable=True)
    sector = Column(String(150), nullable=True)
    training_mode = Column(String(50), default="STT", nullable=False)  # "RPL" or "STT"
    status = Column(String(50), default="enrolled", nullable=False)  # "enrolled", "in_training", "assessment_ready", "certified", "completed"
    
    enrolled_centre_id = Column(String(100), nullable=True)
    enrolled_centre_name = Column(String(255), nullable=True)
    batch_id = Column(Integer, ForeignKey("training_batches.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Completed & Active NOS Competency tracking
    completed_nos_codes = Column(JSON, default=list, nullable=False)
    active_nos_codes = Column(JSON, default=list, nullable=False)
    
    bridge_hours_completed = Column(Integer, default=0, nullable=False)
    total_bridge_hours = Column(Integer, default=60, nullable=False)
    
    certificate_id = Column(String(100), nullable=True)
    certificate_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    def __repr__(self):
        return f"<CandidateProgress user_id={self.user_id} qp_code='{self.qp_code}' status='{self.status}'>"


class ConsentLog(Base):
    __tablename__ = "consent_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    consent_type = Column(String(100), nullable=False)  # "voice_processing", "profile_storage", "training_partner_sharing"
    consent_granted = Column(Boolean, default=True, nullable=False)
    consent_version = Column(String(50), default="v1.0", nullable=False)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)

    def __repr__(self):
        return f"<ConsentLog user_id={self.user_id} type='{self.consent_type}' granted={self.consent_granted}>"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    actor_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_role = Column(String(50), default="candidate", nullable=False, index=True)
    action = Column(String(100), index=True, nullable=False)  # "register_beneficiary", "verify_skill", "export_data", "delete_account", "mark_attendance", "complete_course", "view_candidate_profile"
    target_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    details = Column(JSON, default=dict, nullable=False)
    ip_address = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)

    def __repr__(self):
        return f"<AuditLog action='{self.action}' actor_id={self.actor_id} target_user_id={self.target_user_id}>"


class CandidateFeedback(Base):
    __tablename__ = "candidate_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    qp_code = Column(String(50), nullable=True)
    was_useful = Column(Boolean, default=True, nullable=False)
    did_enrol = Column(Boolean, default=False, nullable=False)
    rating = Column(Integer, default=5, nullable=False)  # 1 to 5
    comments = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)

    def __repr__(self):
        return f"<CandidateFeedback user_id={self.user_id} qp_code='{self.qp_code}' rating={self.rating}>"
