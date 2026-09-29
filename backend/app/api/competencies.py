from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.common import APIResponse
from app.services.security import get_current_user
from app.knowledge.nsqf_catalog import get_all_nsqf_qualifications, get_nsqf_qualification_by_code
from app.ai.competency_matching.gap_analyzer import analyze_competency_gaps
from app.ai.retrieval.rag_engine import retrieve_relevant_nsqf_pathways

router = APIRouter(prefix="/competencies", tags=["NSQF Knowledge Base & Competency Gap Engine"])


class GapAnalysisRequest(BaseModel):
    skills: List[str]
    qp_code: str


@router.get("/occupations", response_model=APIResponse)
def list_verified_occupations():
    """Retrieve all verified NSQF Qualification Packs from the project's authoritative knowledge base."""
    occupations = get_all_nsqf_qualifications()
    return APIResponse(
        success=True,
        message=f"Retrieved {len(occupations)} verified NSQF Qualification Packs.",
        data=occupations
    )


@router.get("/occupations/{qp_code:path}", response_model=APIResponse)
def get_occupation_details(qp_code: str):
    """Retrieve verified QP details, NOS competencies, and training pathways by QP code."""
    qp = get_nsqf_qualification_by_code(qp_code)
    if not qp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Qualification Pack '{qp_code}' not found in verified registry."
        )
    return APIResponse(
        success=True,
        message=f"Verified NSQF Qualification Pack '{qp_code}' retrieved.",
        data=qp
    )


from app.knowledge.training_centres import find_training_centres
from app.knowledge.skill_taxonomy import CANONICAL_SKILL_TAXONOMY, normalize_candidate_skills

@router.post("/gap-analysis", response_model=APIResponse)
def compute_gap_analysis(request: GapAnalysisRequest):
    """Compare candidate skills against target NSQF competencies and compute gap analysis."""
    result = analyze_competency_gaps(request.skills, request.qp_code)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
        
    return APIResponse(
        success=True,
        message="Competency gap analysis computed successfully.",
        data=result
    )


@router.get("/gap-analysis/me", response_model=APIResponse)
def compute_my_gap_analysis(
    qp_code: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compute live competency gaps for authenticated candidate against top NSQF pathway."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found. Complete voice assessment first.")

    cand_skills = [s.skill_name for s in profile.skills]

    # If no specific QP requested, retrieve best match using RAG engine
    target_code = qp_code
    if not target_code:
        top_matches = retrieve_relevant_nsqf_pathways(
            prior_occupation=profile.prior_occupation,
            education=profile.education_level,
            livelihood_goal=profile.livelihood_goal,
            candidate_skills=cand_skills,
            top_k=1
        )
        if top_matches:
            target_code = top_matches[0]["qp_data"]["qp_code"]
        else:
            target_code = "AMH/Q1947"

    profile_dict = {
        "education_level": profile.education_level,
        "prior_occupation": profile.prior_occupation,
        "experience_years": profile.experience_years,
        "livelihood_goal": profile.livelihood_goal,
        "resources": profile.resources,
        "constraints": profile.constraints
    }

    result = analyze_competency_gaps(cand_skills, target_code, profile_dict)
    return APIResponse(
        success=True,
        message=f"Live competency gap analysis generated for QP {target_code}.",
        data=result
    )


@router.get("/centres", response_model=APIResponse)
def list_training_centres(
    qp_code: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    max_distance_km: Optional[float] = None
):
    """
    Search verified training centres (PMKK, ITIs, NSDC) filtered by QP course, state,
    district, and great-circle GPS distance in kilometers.
    """
    centres = find_training_centres(
        qp_code=qp_code,
        state=state,
        district=district,
        user_lat=user_lat,
        user_lon=user_lon,
        max_distance_km=max_distance_km
    )
    return APIResponse(
        success=True,
        message=f"Found {len(centres)} verified training centre(s).",
        data=centres
    )


@router.get("/taxonomy", response_model=APIResponse)
def get_canonical_skill_taxonomy():
    """Retrieve canonical vocational skill taxonomy mapped to NOS modules and vernacular aliases."""
    return APIResponse(
        success=True,
        message=f"Retrieved {len(CANONICAL_SKILL_TAXONOMY)} canonical skill taxonomy nodes.",
        data=list(CANONICAL_SKILL_TAXONOMY.values())
    )

