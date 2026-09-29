from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AnalyzeAssessmentRequest(BaseModel):
    text: str = Field(..., description="Natural language spoken transcript or text in English or Tamil")
    language: Optional[str] = "auto"  # 'en', 'ta', or 'auto'
    session_id: Optional[str] = None


class ExtractedSkill(BaseModel):
    skill_name: str
    canonical_name: str
    category: str  # technical, soft, digital, safety
    proficiency_level: str  # beginner, intermediate, advanced
    confidence: float
    source_snippet: Optional[str] = None


class ExtractedProfileData(BaseModel):
    education: str
    qualification: str
    experience_years: float
    prior_occupation: str
    work_history: List[Dict[str, Any]] = Field(default_factory=list)
    resources: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    livelihood_goal: str  # 'self-employment', 'employment', 'unknown'
    work_preference: str  # 'home-based', 'field', 'office', 'flexible'
    interests: List[str] = Field(default_factory=list)


class AssessmentAnalyzeResponse(BaseModel):
    raw_text: str
    detected_language: str
    profile: ExtractedProfileData
    extracted_skills: List[ExtractedSkill]
    unresolved_fields: List[str]
    is_explainable: bool = True
