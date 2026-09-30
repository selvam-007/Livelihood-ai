from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: str
    role: Optional[str] = "candidate"
    phone: Optional[str] = None
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None
    organisation_name: Optional[str] = None
    agent_id: Optional[int] = None


class UserCreate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    full_name: str
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def check_email_or_phone(cls, values: Any) -> Any:
        if isinstance(values, dict):
            email = values.get("email")
            phone = values.get("phone")
            if email and "@" not in str(email):
                if not phone:
                    values["phone"] = str(email).strip()
                values["email"] = None
        return values


class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str

    @model_validator(mode="before")
    @classmethod
    def check_email_or_phone(cls, values: Any) -> Any:
        if isinstance(values, dict):
            email = values.get("email")
            phone = values.get("phone")
            if email and "@" not in str(email):
                if not phone:
                    values["phone"] = str(email).strip()
                values["email"] = None
        return values


class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="Mobile number with or without country code")
    language: Optional[str] = "en"


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="Mobile number with or without country code")
    otp: str = Field(..., min_length=4, max_length=10, description="Numeric OTP code")
    full_name: Optional[str] = None
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None


class AdminCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters required")
    full_name: str
    phone: Optional[str] = None
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None


class PromoteAdminRequest(BaseModel):
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = "admin"  # 'admin', 'field_agent', 'training_provider'


class BeneficiaryCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_language: Optional[str] = "en"
    location: Optional[str] = None
    education: Optional[str] = "10th Standard"
    prior_occupation: Optional[str] = "None"
    livelihood_goal: Optional[str] = "employment"
    initial_skills: Optional[List[str]] = Field(default_factory=list)


class SkillVerificationRequest(BaseModel):
    skill_name: str
    proficiency_level: Optional[str] = "intermediate"  # beginner, intermediate, advanced
    is_verified: bool = True
    verification_notes: Optional[str] = None


class TrainingBatchCreate(BaseModel):
    batch_name: str = Field(..., min_length=3)
    qp_code: str
    qualification_name: Optional[str] = None
    centre_name: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_capacity: int = 30


class AttendanceUpdateRequest(BaseModel):
    date: str  # YYYY-MM-DD
    present: bool = True
    attendance_percentage: Optional[float] = None
    notes: Optional[str] = None


class BatchCompletionRequest(BaseModel):
    status: str = "certified"  # "completed", "certified"
    certificate_id: Optional[str] = None
    notes: Optional[str] = None


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
