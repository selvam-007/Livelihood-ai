from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class VoiceQuestion(BaseModel):
    id: int
    key: str  # education, skills, experience, duration, interests, goal, resources, employment_type, constraints
    question_en: str
    question_ta: str
    question_hi: Optional[str] = None
    placeholder_en: str
    placeholder_ta: str
    placeholder_hi: Optional[str] = None
    sample_answer_en: str
    sample_answer_ta: str
    sample_answer_hi: Optional[str] = None
    questions_by_lang: Optional[Dict[str, str]] = None
    placeholders_by_lang: Optional[Dict[str, str]] = None
    sample_answers_by_lang: Optional[Dict[str, str]] = None


class TranscribeRequest(BaseModel):
    text: str
    language: Optional[str] = "en"  # e.g., "en", "hi", "ta", "te", "kn", "ml", "mr", "bn", "gu", "pa", "or"
    question_id: Optional[int] = None


class VoiceSessionAnswer(BaseModel):
    question_id: Optional[int] = 1
    question_key: Optional[str] = "story"
    user_transcript: Optional[str] = ""
    spoken_answer: Optional[str] = None
    question_text: Optional[str] = None
    language: Optional[str] = "en"

    def get_text(self) -> str:
        return (self.user_transcript or self.spoken_answer or "").strip()


class VoiceSessionSubmission(BaseModel):
    answers: Optional[List[VoiceSessionAnswer]] = Field(default_factory=list)
    full_transcript: Optional[str] = None
    session_id: Optional[str] = None
    language: Optional[str] = "en"
    user_id: Optional[int] = None


class VoiceSessionResult(BaseModel):
    session_id: str
    questions_completed: int
    language: str
    extracted_summary: Dict[str, Any]
    profile: Optional[Dict[str, Any]] = None
    extracted_skills: Optional[List[str]] = Field(default_factory=list)
    skills_extracted_detailed: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    recommended_role: Optional[str] = None
    qp_code: Optional[str] = None
    nsqf_level: Optional[str] = None
    match_score: Optional[float] = None
    suitability_explanation: Optional[str] = None
    development_roadmap: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    development_summary: Optional[str] = None
    skills_to_develop: Optional[List[str]] = Field(default_factory=list)
    learning_actions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    status: str = "success"
