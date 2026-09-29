from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class SkillBase(BaseModel):
    skill_name: str
    category: Optional[str] = "technical"
    proficiency_level: Optional[str] = "intermediate"
    is_verified: Optional[bool] = False
    source: Optional[str] = "voice_extracted"


class SkillCreate(SkillBase):
    pass


class SkillOut(SkillBase):
    id: int
    profile_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileBase(BaseModel):
    education_level: Optional[str] = "unknown"
    qualification: Optional[str] = "unknown"
    subjects: Optional[List[str]] = Field(default_factory=list)
    experience_years: Optional[float] = 0.0
    prior_occupation: Optional[str] = "unknown"
    work_history: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    livelihood_goal: Optional[str] = "employment"
    work_preference: Optional[str] = "flexible"
    interests: Optional[List[str]] = Field(default_factory=list)
    resources: Optional[List[str]] = Field(default_factory=list)
    constraints: Optional[List[str]] = Field(default_factory=list)


class ProfileCreate(ProfileBase):
    skills: Optional[List[SkillCreate]] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    qualification: Optional[str] = None
    subjects: Optional[List[str]] = None
    experience_years: Optional[float] = None
    prior_occupation: Optional[str] = None
    work_history: Optional[List[Dict[str, Any]]] = None
    livelihood_goal: Optional[str] = None
    work_preference: Optional[str] = None
    interests: Optional[List[str]] = None
    resources: Optional[List[str]] = None
    constraints: Optional[List[str]] = None


class ProfileOut(ProfileBase):
    id: int
    user_id: Optional[int] = None
    completion_percentage: int
    skills: List[SkillOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
