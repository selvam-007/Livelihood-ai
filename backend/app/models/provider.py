from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class TrainingBatch(Base):
    __tablename__ = "training_batches"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    batch_name = Column(String(255), nullable=False)
    qp_code = Column(String(50), index=True, nullable=False)
    qualification_name = Column(String(255), nullable=True)
    centre_name = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    max_capacity = Column(Integer, default=30, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    enrollments = relationship("BatchEnrollment", back_populates="batch", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TrainingBatch id={self.id} name='{self.batch_name}' qp='{self.qp_code}'>"


class BatchEnrollment(Base):
    __tablename__ = "batch_enrollments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    batch_id = Column(Integer, ForeignKey("training_batches.id", ondelete="CASCADE"), index=True, nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    attendance_percentage = Column(Float, default=0.0, nullable=False)
    attendance_records = Column(JSON, default=list, nullable=False)
    status = Column(String(50), default="enrolled", nullable=False)  # enrolled, in_training, completed, certified, dropped
    completion_date = Column(DateTime, nullable=True)
    certificate_id = Column(String(100), nullable=True)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    batch = relationship("TrainingBatch", back_populates="enrollments")

    def __repr__(self):
        return f"<BatchEnrollment id={self.id} batch_id={self.batch_id} candidate_id={self.candidate_id} status='{self.status}'>"
