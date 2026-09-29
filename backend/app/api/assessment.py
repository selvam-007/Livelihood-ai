import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile, UserSkill
from app.schemas.common import APIResponse
from app.schemas.ai import (
    AnalyzeAssessmentRequest, 
    AssessmentAnalyzeResponse,
    ExtractedSkill
)
from app.schemas.profile import SkillCreate
from app.services.security import get_current_user
from app.services.profile_service import (
    get_or_create_profile,
    add_skill_to_profile,
    calculate_completion_percentage
)
from app.ai.profile_extraction.extractor import extract_structured_profile
from app.ai.skill_extraction.skill_normalizer import extract_and_normalize_skills

router = APIRouter(prefix="/assessment", tags=["AI Natural Language Profile & Skill Extraction"])


def detect_text_language(text: str) -> str:
    """Simple detector for Tamil Unicode vs English Latin script."""
    # Tamil Unicode block: U+0B80 to U+0BFF
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    return "en"


@router.post("/analyze", response_model=APIResponse)
def analyze_voice_text(request: AnalyzeAssessmentRequest):
    """
    Core AI Extraction Engine per Section 3, 5 & 25:
    Voice/Text -> NLP/LLM Extraction -> Structured Profile + Canonical Skills.
    Never invents unmentioned information; marks absent fields as 'unknown'.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Input text is empty. Please provide conversational voice or text description."
        )

    # Detect language if auto
    language = request.language if request.language and request.language != "auto" else detect_text_language(request.text)

    # 1. Extract structured profile
    extracted_profile, unresolved = extract_structured_profile(request.text)

    # 2. Extract and canonicalize skills
    extracted_skills = extract_and_normalize_skills(request.text)

    response_payload = AssessmentAnalyzeResponse(
        raw_text=request.text.strip(),
        detected_language=language,
        profile=extracted_profile,
        extracted_skills=extracted_skills,
        unresolved_fields=unresolved,
        is_explainable=True
    )

    return APIResponse(
        success=True,
        message="Profile and skills extracted successfully from natural language input.",
        data=response_payload.model_dump()
    )


@router.post("/apply-to-profile", response_model=APIResponse)
def apply_extracted_assessment_to_profile(
    request: AnalyzeAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extracts profile and skills from voice text and immediately updates the candidate's database profile.
    """
    extracted_profile, _ = extract_structured_profile(request.text)
    extracted_skills = extract_and_normalize_skills(request.text)

    profile = get_or_create_profile(db, current_user.id)

    # Update profile fields if extracted
    if extracted_profile.education != "unknown":
        profile.education_level = extracted_profile.education
        profile.qualification = extracted_profile.qualification
    if extracted_profile.prior_occupation != "unknown":
        profile.prior_occupation = extracted_profile.prior_occupation
    if extracted_profile.experience_years > 0:
        profile.experience_years = extracted_profile.experience_years
    if extracted_profile.livelihood_goal != "unknown":
        profile.livelihood_goal = extracted_profile.livelihood_goal
    if extracted_profile.work_preference != "flexible":
        profile.work_preference = extracted_profile.work_preference
    if extracted_profile.resources:
        profile.resources = list(set(profile.resources + extracted_profile.resources))
    if extracted_profile.constraints:
        profile.constraints = list(set(profile.constraints + extracted_profile.constraints))

    # Add extracted skills
    for sk in extracted_skills:
        add_skill_to_profile(
            db,
            profile.id,
            SkillCreate(
                skill_name=sk.canonical_name,
                category=sk.category,
                proficiency_level=sk.proficiency_level,
                is_verified=False,
                source="voice_extracted"
            )
        )

    profile.completion_percentage = calculate_completion_percentage(profile)
    db.commit()
    db.refresh(profile)

    return APIResponse(
        success=True,
        message="Extracted profile and skills successfully applied to your candidate account.",
        data={"profile_id": profile.id, "completion_percentage": profile.completion_percentage}
    )
