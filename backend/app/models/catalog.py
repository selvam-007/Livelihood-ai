"""
Database models for NSQF catalog, schemes, and training centres.
Replaces static Python knowledge files with queryable, admin-manageable DB tables.

Each row has source_url, last_verified_at, and is_active for provenance tracking.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, DateTime,
    Text, JSON, Index, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database.base import Base


def utc_now():
    return datetime.now(timezone.utc)


class QualificationPack(Base):
    """NSQF Qualification Pack (QP) master table."""
    __tablename__ = "qualification_packs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    qp_code = Column(String(50), unique=True, nullable=False, index=True)
    qualification_name = Column(String(255), nullable=False)
    nsqf_level = Column(String(20), nullable=False)
    sector = Column(String(150), nullable=False, index=True)
    council = Column(String(255), nullable=True)
    min_education = Column(String(100), nullable=True)
    preferred_education = Column(String(100), nullable=True)
    min_experience_years = Column(Float, default=0.0)
    training_duration_hours = Column(Integer, nullable=True)
    official_scheme = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    # JSON arrays / objects
    required_skills = Column(JSON, default=list)
    competencies = Column(JSON, default=list)
    employment_pathways = Column(JSON, default=dict)
    self_employment_pathways = Column(JSON, default=dict)
    regional_demand = Column(JSON, default=dict)
    suitable_for = Column(JSON, default=list)
    keywords = Column(JSON, default=list)
    # Provenance
    source_url = Column(String(512), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    nos_modules = relationship("NOSModule", back_populates="qualification_pack", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_qp_sector_active", "sector", "is_active"),
    )

    def __repr__(self):
        return f"<QP {self.qp_code} '{self.qualification_name}'>"


class NOSModule(Base):
    """National Occupational Standard (NOS) module within a QP."""
    __tablename__ = "nos_modules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    qp_id = Column(Integer, ForeignKey("qualification_packs.id", ondelete="CASCADE"), nullable=False, index=True)
    nos_code = Column(String(50), nullable=False, index=True)
    title = Column(Text, nullable=False)
    urgency = Column(String(50), nullable=True)
    criticality = Column(String(100), nullable=True)
    related_skills = Column(JSON, default=list)
    is_active = Column(Boolean, default=True, nullable=False)
    source_url = Column(String(512), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    qualification_pack = relationship("QualificationPack", back_populates="nos_modules")

    def __repr__(self):
        return f"<NOS {self.nos_code} qp_id={self.qp_id}>"


class GovernmentScheme(Base):
    """Government skilling / livelihood scheme master."""
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheme_code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    ministry = Column(String(255), nullable=True)
    primary_benefit = Column(Text, nullable=True)
    stipend_reward = Column(Text, nullable=True)
    eligibility_summary = Column(Text, nullable=True)
    application_url = Column(String(512), nullable=True)
    # Structured eligibility rules (replaces ad-hoc Python logic)
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    min_education_code = Column(String(50), nullable=True)   # "8th", "10th", "12th", "graduate"
    max_income_annual = Column(Integer, nullable=True)        # rupees
    requires_rural = Column(Boolean, nullable=True)
    applicable_categories = Column(JSON, default=list)        # ["SC", "ST", "OBC", "General"]
    applicable_states = Column(JSON, default=list)            # [] means all states
    eligible_livelihood_goals = Column(JSON, default=list)    # ["Wage Employment", "Self-Employment"]
    # Provenance
    source_url = Column(String(512), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    def __repr__(self):
        return f"<Scheme {self.scheme_code} '{self.name}'>"


class TrainingCentre(Base):
    """Verified training centre directory."""
    __tablename__ = "training_centres"

    id = Column(Integer, primary_key=True, autoincrement=True)
    centre_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    centre_type = Column(String(100), nullable=True, index=True)  # PMKK, Government ITI, JSS, NSDC Partner
    address = Column(Text, nullable=True)
    district = Column(String(150), nullable=False, index=True)
    state = Column(String(150), nullable=False, index=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    contact_person = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)    # None or clearly labelled placeholder per Rule 5
    email = Column(String(150), nullable=True)
    official_portal = Column(String(512), nullable=True)
    affiliated_qp_codes = Column(JSON, default=list)
    official_schemes = Column(JSON, default=list)
    available_seats = Column(Integer, nullable=True)
    next_batch_date = Column(String(20), nullable=True)
    facilities = Column(JSON, default=list)
    # Provenance
    source_url = Column(String(512), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        Index("ix_tc_district_active", "district", "is_active"),
        Index("ix_tc_state_active", "state", "is_active"),
    )

    def __repr__(self):
        return f"<TrainingCentre {self.centre_id} '{self.name}'>"