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
    question_id: int
    question_key: str
    user_transcript: str
    language: Optional[str] = "en"


class VoiceSessionSubmission(BaseModel):
    answers: List[VoiceSessionAnswer]
    full_transcript: Optional[str] = None
    language: Optional[str] = "en"
    user_id: Optional[int] = None


class VoiceSessionResult(BaseModel):
    session_id: str
    questions_completed: int
    language: str
    extracted_summary: Dict[str, Any]
