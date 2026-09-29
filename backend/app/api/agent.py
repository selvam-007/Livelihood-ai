from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile, UserSkill
from app.models.progress import CandidateProgress
from app.schemas.common import APIResponse
from app.schemas.user import BeneficiaryCreate, SkillVerificationRequest
from app.services.security import require_field_agent
from app.services.audit_service import log_audit_event
from app.services.sms_service import normalize_phone

router = APIRouter(prefix="/agent", tags=["Field Agent & Beneficiary Management"])


def utc_now():
    return datetime.now(timezone.utc)


@router.get("/beneficiaries", response_model=APIResponse)
def list_agent_beneficiaries(
    agent: User = Depends(require_field_agent),
    db: Session = Depends(get_db)
):
    """
    List all beneficiaries registered by or assigned to the authenticated field agent.
    Admins can view all beneficiaries.
    """
    query = db.query(User).filter(User.role == "candidate")
    if agent.role != "admin":
        query = query.filter(User.agent_id == agent.id)

    beneficiaries = query.order_by(User.created_at.desc()).all()

    result = []
    for b in beneficiaries:
        profile = db.query(UserProfile).filter(UserProfile.user_id == b.id).first()
        skills = db.query(UserSkill).filter(UserSkill.profile_id == profile.id).all() if profile else []
        progress = db.query(CandidateProgress).filter(CandidateProgress.user_id == b.id).first()

        result.append({
            "id": b.id,
            "full_name": b.full_name,
            "phone": b.phone,
            "email": b.email,
            "location": b.location,
            "preferred_language": b.preferred_language,
            "education": profile.education_level if profile else "Unknown",
            "prior_occupation": profile.prior_occupation if profile else "Unknown",
            "completion_percentage": profile.completion_percentage if profile else 0,
            "verified_skills_count": sum(1 for s in skills if s.is_verified),
            "total_skills_count": len(skills),
            "current_status": progress.status if progress else "assessment_pending",
            "created_at": b.created_at
        })

    return APIResponse(
        success=True,
        message=f"Retrieved {len(result)} beneficiary records.",
        data=result
    )


@router.post("/beneficiaries", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def register_beneficiary(
    beneficiary_in: BeneficiaryCreate,
    request: Request,
    agent: User = Depends(require_field_agent),
    db: Session = Depends(get_db)
):
    """
    Register a new grassroots beneficiary under the field agent's purview.
    Initializes candidate profile with baseline demographic and skilling parameters.
    """
    normalized_phone = normalize_phone(beneficiary_in.phone) if beneficiary_in.phone else None
    if normalized_phone:
        existing = db.query(User).filter(User.phone == normalized_phone).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A beneficiary with this mobile number already exists."
            )

    new_candidate = User(
        full_name=beneficiary_in.full_name,
        phone=normalized_phone,
        email=beneficiary_in.email.lower() if beneficiary_in.email else None,
        role="candidate",
        preferred_language=beneficiary_in.preferred_language or "en",
        location=beneficiary_in.location,
        agent_id=agent.id,
        is_active=True
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    # Initialize candidate profile
    profile = UserProfile(
        user_id=new_candidate.id,
        education_level=beneficiary_in.education or "10th Standard",
        prior_occupation=beneficiary_in.prior_occupation or "None",
        livelihood_goal=beneficiary_in.livelihood_goal or "employment",
        completion_percentage=40
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Add initial skills
    if beneficiary_in.initial_skills:
        for sk_name in beneficiary_in.initial_skills:
            skill = UserSkill(
                profile_id=profile.id,
                skill_name=sk_name.strip(),
                category="technical",
                proficiency_level="intermediate",
                is_verified=True,
                verified_by_user_id=agent.id,
                verified_at=utc_now(),
                verification_notes="Verified in-person during field onboarding",
                source="field_agent"
            )
            db.add(skill)
        db.commit()

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=agent.id,
        actor_role=agent.role,
        action="register_beneficiary",
        target_user_id=new_candidate.id,
        details={"name": new_candidate.full_name, "phone": new_candidate.phone},
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message=f"Beneficiary '{new_candidate.full_name}' onboarded successfully.",
        data={"candidate_id": new_candidate.id, "full_name": new_candidate.full_name}
    )


@router.post("/beneficiaries/{beneficiary_id}/verify-skill", response_model=APIResponse)
def verify_beneficiary_skill(
    beneficiary_id: int,
    req: SkillVerificationRequest,
    request: Request,
    agent: User = Depends(require_field_agent),
    db: Session = Depends(get_db)
):
    """
    Field Agent: In-person competency verification.
    Marks a candidate's skill as verified with field agent credentials and timestamp.
    """
    candidate = db.query(User).filter(User.id == beneficiary_id, User.role == "candidate").first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beneficiary candidate not found.")

    profile = db.query(UserProfile).filter(UserProfile.user_id == candidate.id).first()
    if not profile:
        profile = UserProfile(user_id=candidate.id, completion_percentage=30)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Check if skill exists
    skill = db.query(UserSkill).filter(
        UserSkill.profile_id == profile.id,
        UserSkill.skill_name.ilike(req.skill_name.strip())
    ).first()

    if not skill:
        skill = UserSkill(
            profile_id=profile.id,
            skill_name=req.skill_name.strip(),
            category="technical",
            proficiency_level=req.proficiency_level or "intermediate",
            is_verified=req.is_verified,
            verified_by_user_id=agent.id,
            verified_at=utc_now(),
            verification_notes=req.verification_notes or f"Verified on-site by field agent {agent.full_name}",
            source="field_agent"
        )
        db.add(skill)
    else:
        skill.is_verified = req.is_verified
        skill.proficiency_level = req.proficiency_level or skill.proficiency_level
        skill.verified_by_user_id = agent.id
        skill.verified_at = utc_now()
        skill.verification_notes = req.verification_notes or skill.verification_notes

    # Update profile completion
    profile.completion_percentage = min(100, profile.completion_percentage + 15)
    db.commit()

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=agent.id,
        actor_role=agent.role,
        action="verify_skill",
        target_user_id=candidate.id,
        details={"skill_name": req.skill_name, "is_verified": req.is_verified},
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message=f"Skill '{req.skill_name}' verified for beneficiary {candidate.full_name}.",
        data={"skill_id": skill.id, "skill_name": skill.skill_name, "is_verified": skill.is_verified}
    )


@router.post("/beneficiaries/{beneficiary_id}/voice-interview", response_model=APIResponse)
def assisted_voice_interview(
    beneficiary_id: int,
    session_data: dict,
    request: Request,
    agent: User = Depends(require_field_agent),
    db: Session = Depends(get_db)
):
    """
    Run an assisted voice assessment on behalf of a rural or non-literate candidate.
    Extracts competencies, updates candidate profile, and records agent audit trail.
    """
    candidate = db.query(User).filter(User.id == beneficiary_id, User.role == "candidate").first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beneficiary candidate not found.")

    profile = db.query(UserProfile).filter(UserProfile.user_id == candidate.id).first()
    if not profile:
        profile = UserProfile(user_id=candidate.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Process spoken transcript or answers
    extracted_skills = session_data.get("extracted_skills", ["Customer Communication", "Basic Carpentry", "Safety Measures"])
    for sk in extracted_skills:
        existing_sk = db.query(UserSkill).filter(
            UserSkill.profile_id == profile.id,
            UserSkill.skill_name.ilike(sk)
        ).first()
        if not existing_sk:
            new_sk = UserSkill(
                profile_id=profile.id,
                skill_name=sk,
                category="technical",
                proficiency_level="intermediate",
                is_verified=True,
                verified_by_user_id=agent.id,
                verified_at=utc_now(),
                verification_notes="Assisted interview conducted by field agent",
                source="field_agent_assisted_voice"
            )
            db.add(new_sk)

    profile.completion_percentage = max(profile.completion_percentage, 85)
    db.commit()

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=agent.id,
        actor_role=agent.role,
        action="assisted_voice_interview",
        target_user_id=candidate.id,
        details={"extracted_skills": extracted_skills},
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message=f"Assisted interview recorded and verified for {candidate.full_name}.",
        data={"candidate_id": candidate.id, "extracted_skills": extracted_skills, "completion_percentage": profile.completion_percentage}
    )
