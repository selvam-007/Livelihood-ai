from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class UserProfile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=True, index=True)

    # Education
    education_level = Column(String(100), default="unknown", nullable=False)
    qualification = Column(String(150), default="unknown", nullable=False)
    subjects = Column(JSON, default=list, nullable=False)

    # Experience
    experience_years = Column(Float, default=0.0, nullable=False)
    prior_occupation = Column(String(150), default="unknown", nullable=False)
    work_history = Column(JSON, default=list, nullable=False)

    # Interests & Livelihood Goal
    livelihood_goal = Column(String(100), default="employment", nullable=False)
    work_preference = Column(String(100), default="flexible", nullable=False)
    interests = Column(JSON, default=list, nullable=False)

    # Resources & Constraints
    resources = Column(JSON, default=list, nullable=False)
    constraints = Column(JSON, default=list, nullable=False)

    # Profile Readiness
    completion_percentage = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    skills = relationship("UserSkill", back_populates="profile", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<UserProfile id={self.id} user_id={self.user_id} goal='{self.livelihood_goal}'>"


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    skill_name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), default="technical", nullable=False)  # technical, soft, digital, safety
    proficiency_level = Column(String(50), default="intermediate", nullable=False)  # beginner, intermediate, advanced
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_notes = Column(String(255), nullable=True)
    source = Column(String(50), default="voice_extracted", nullable=False)  # voice_extracted, self_reported, field_agent, assessed

    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="skills")

    def __repr__(self):
        return f"<UserSkill id={self.id} skill='{self.skill_name}' category='{self.category}' verified={self.is_verified}>"
