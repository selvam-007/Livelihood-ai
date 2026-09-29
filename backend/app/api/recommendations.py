from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.common import APIResponse
from app.services.security import get_current_user
from app.ai.recommendation.recommendation_engine import rank_livelihood_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])


from app.knowledge.schemes_engine import evaluate_scheme_eligibility

class ProfileRankRequest(BaseModel):
    education: Optional[str] = "unknown"
    prior_occupation: Optional[str] = "unknown"
    experience_years: Optional[float] = 0.0
    livelihood_goal: Optional[str] = "employment"
    skills: List[str] = []
    resources: List[str] = []
    constraints: List[str] = []


class SchemeEligibilityRequest(BaseModel):
    education: Optional[str] = "unknown"
    prior_occupation: Optional[str] = "unknown"
    experience_years: Optional[float] = 0.0
    livelihood_goal: Optional[str] = "employment"
    target_qp_code: Optional[str] = None


@router.post("/rank", response_model=APIResponse)
def rank_pathways_for_profile(request: ProfileRankRequest):
    """
    Ranks viable NSQF livelihood pathways based on candidate skills, experience, resources, and constraints.
    Outputs multiple ranked recommendations with transparent match scores and explanations.
    """
    ranked = rank_livelihood_recommendations(
        education=request.education,
        prior_occupation=request.prior_occupation,
        experience_years=request.experience_years,
        livelihood_goal=request.livelihood_goal,
        candidate_skills=request.skills,
        resources=request.resources,
        constraints=request.constraints
    )

    return APIResponse(
        success=True,
        message=f"Generated {len(ranked)} ranked NSQF livelihood pathways.",
        data=ranked
    )


@router.get("/me", response_model=APIResponse)
def get_my_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve personalized, ranked NSQF recommendations for the authenticated candidate."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete voice assessment first."
        )

    cand_skills = [s.skill_name for s in profile.skills]
    ranked = rank_livelihood_recommendations(
        education=profile.education_level,
        prior_occupation=profile.prior_occupation,
        experience_years=profile.experience_years,
        livelihood_goal=profile.livelihood_goal,
        candidate_skills=cand_skills,
        resources=profile.resources,
        constraints=profile.constraints
    )

    return APIResponse(
        success=True,
        message="Ranked recommendations generated for your profile.",
        data=ranked
    )


@router.post("/scheme-eligibility", response_model=APIResponse)
def check_scheme_eligibility(request: SchemeEligibilityRequest):
    """
    Evaluates candidate profile against central & state skilling schemes (PMKVY 4.0, RPL, PM Vishwakarma, NAPS, Mudra).
    """
    profile_data = {
        "education": request.education,
        "prior_occupation": request.prior_occupation,
        "experience_years": request.experience_years,
        "livelihood_goal": request.livelihood_goal
    }
    schemes = evaluate_scheme_eligibility(profile_data, request.target_qp_code)
    return APIResponse(
        success=True,
        message=f"Evaluated eligibility across {len(schemes)} government livelihood schemes.",
        data=schemes
    )


@router.get("/scheme-eligibility/me", response_model=APIResponse)
def check_my_scheme_eligibility(
    target_qp_code: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Evaluates authenticated candidate's eligibility across all government skilling schemes."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found.")

    profile_data = {
        "education": profile.education_level,
        "prior_occupation": profile.prior_occupation,
        "experience_years": profile.experience_years,
        "livelihood_goal": profile.livelihood_goal
    }
    schemes = evaluate_scheme_eligibility(profile_data, target_qp_code)
    return APIResponse(
        success=True,
        message=f"Found {len([s for s in schemes if s.get('is_eligible')])} eligible government schemes.",
        data=schemes
    )

