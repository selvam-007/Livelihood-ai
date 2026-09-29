from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.common import APIResponse
from app.services.security import get_current_user
from app.ai.pathway_generation.roadmap_engine import generate_personalized_roadmap
from app.ai.explanation.explainer import generate_explanation
from app.knowledge.nsqf_catalog import get_nsqf_qualification_by_code

router = APIRouter(prefix="/pathways", tags=["Personalized Roadmaps & AI Explainability"])


@router.get("/roadmap/{qp_code:path}", response_model=APIResponse)
def get_roadmap_for_qp(
    qp_code: str,
    education: Optional[str] = "10th Standard",
    prior_occupation: Optional[str] = "Helper",
    experience_years: Optional[float] = 1.0,
    livelihood_goal: Optional[str] = "employment"
):
    """Generate 5-stage visual roadmap for a target Qualification Pack."""
    profile_data = {
        "education_level": education,
        "prior_occupation": prior_occupation,
        "experience_years": experience_years,
        "livelihood_goal": livelihood_goal,
        "skills": []
    }
    roadmap = generate_personalized_roadmap(profile_data, qp_code)
    if "error" in roadmap:
        raise HTTPException(status_code=404, detail=roadmap["error"])
        
    return APIResponse(
        success=True,
        message=f"Roadmap generated for {qp_code}.",
        data=roadmap
    )


@router.get("/roadmap/candidate/me", response_model=APIResponse)
def get_my_personalized_roadmap(
    qp_code: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate 5-stage visual roadmap personalized to authenticated candidate."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")

    target_code = qp_code or ("AMH/Q1947" if "tailor" in profile.prior_occupation.lower() else "ELE/Q6001")
    profile_dict = {
        "education_level": profile.education_level,
        "prior_occupation": profile.prior_occupation,
        "experience_years": profile.experience_years,
        "livelihood_goal": profile.livelihood_goal,
        "resources": profile.resources,
        "skills": [{"skill_name": s.skill_name} for s in profile.skills]
    }

    roadmap = generate_personalized_roadmap(profile_dict, target_code)
    return APIResponse(
        success=True,
        message="Personalized candidate roadmap generated.",
        data=roadmap
    )


@router.get("/explain", response_model=APIResponse)
def explain_recommendation(
    qp_code: str = Query("AMH/Q1947", description="Target Qualification Pack code"),
    question: str = Query("why", description="Question type: 'why', 'learn_first', 'next_steps'"),
    language: str = Query("en", description="Language: 'en' or 'ta'")
):
    """
    Explainable AI endpoint per Section 12:
    Explains 'Why was this recommended?', 'What to learn first?', or 'Next steps' in English or Tamil.
    """
    sample_profile = {
        "prior_occupation": "Tailoring & Stitching",
        "experience_years": 2.0,
        "livelihood_goal": "self-employment",
        "resources": ["Sewing Machine", "Measuring Kit"]
    }
    explanation = generate_explanation(question, sample_profile, qp_code, language)
    return APIResponse(
        success=True,
        message="AI explanation generated successfully.",
        data=explanation
    )
