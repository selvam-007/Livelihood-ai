from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from app.database.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="candidate", nullable=False, index=True)  # 'candidate', 'field_agent', 'training_provider', 'admin'
    preferred_language = Column(String(10), default="en", nullable=False)  # 'en', 'hi', 'ta', etc.
    location = Column(String(255), nullable=True)
    organisation_name = Column(String(255), nullable=True)  # For training providers / partner agencies
    agent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)  # For beneficiaries registered by field agent
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    def __repr__(self):
        return f"<User id={self.id} role='{self.role}' phone='{self.phone}' email='{self.email}'>"