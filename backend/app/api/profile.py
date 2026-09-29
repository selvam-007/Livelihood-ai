from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile, UserSkill
from app.models.progress import CandidateProgress, ConsentLog, CandidateFeedback, AuditLog
from app.schemas.profile import ProfileOut, ProfileUpdate, SkillCreate, SkillOut
from app.schemas.common import APIResponse
from app.services.security import get_current_user, require_admin
from app.services.audit_service import log_audit_event
from app.services.profile_service import (
    get_or_create_profile,
    update_profile_data,
    add_skill_to_profile,
    calculate_completion_percentage
)

router = APIRouter(prefix="/profile", tags=["Candidate Profile Engine"])


@router.get("/me", response_model=APIResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch structured profile of authenticated candidate."""
    profile = get_or_create_profile(db, current_user.id)
    return APIResponse(
        success=True,
        message="Candidate profile retrieved successfully.",
        data=ProfileOut.model_validate(profile).model_dump()
    )


@router.put("/me", response_model=APIResponse)
def update_my_profile(
    update_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile fields (education, experience, resources, constraints, livelihood goal)."""
    profile = get_or_create_profile(db, current_user.id)
    updated = update_profile_data(db, profile, update_in)
    return APIResponse(
        success=True,
        message="Profile updated and completeness recalculated.",
        data=ProfileOut.model_validate(updated).model_dump()
    )


@router.post("/me/skills", response_model=APIResponse)
def add_my_skill(
    skill_in: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a skill to the candidate's profile."""
    profile = get_or_create_profile(db, current_user.id)
    skill = add_skill_to_profile(db, profile.id, skill_in)
    return APIResponse(
        success=True,
        message="Skill added to profile successfully.",
        data=SkillOut.model_validate(skill).model_dump()
    )


@router.delete("/me/skills/{skill_id}", response_model=APIResponse)
def remove_my_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a skill from the candidate's profile."""
    profile = get_or_create_profile(db, current_user.id)
    skill = db.query(UserSkill).filter(
        UserSkill.id == skill_id,
        UserSkill.profile_id == profile.id
    ).first()
    
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in candidate profile."
        )
        
    db.delete(skill)
    db.commit()
    profile.completion_percentage = calculate_completion_percentage(profile)
    db.commit()
    
    return APIResponse(
        success=True,
        message="Skill removed from profile.",
        data={"deleted_skill_id": skill_id}
    )


@router.post("/seed-sample-profiles", response_model=APIResponse)
def seed_sample_profiles(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Seeds rich synthetic profiles into the database.
    Protected strictly by require_admin and disabled in production.
    """
    if not settings.ALLOW_DEMO_SEEDING or settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sample profile seeding is disabled in production environments."
        )
    samples = [
        {
            "user_email": "candidate@livelihood.ai",
            "education_level": "12th Standard (Higher Secondary)",
            "qualification": "HSC Vocational / Arts",
            "subjects": ["Basic Stitching", "General Mathematics"],
            "experience_years": 2.0,
            "prior_occupation": "Apparel Stitching Assistant",
            "livelihood_goal": "self-employment",
            "work_preference": "home-based",
            "interests": ["Bespoke Tailoring", "Embroidery", "Boutique Management"],
            "resources": ["Manual Sewing Machine", "Pattern Scraps", "Measuring Kit", "Smartphone with UPI"],
            "constraints": ["Cannot travel more than 5km from residence", "Flexible afternoon hours"],
            "skills": [
                {"skill_name": "Basic Machine Stitching", "category": "technical", "proficiency_level": "intermediate", "is_verified": True},
                {"skill_name": "Fabric Cutting & Marking", "category": "technical", "proficiency_level": "basic", "is_verified": True},
                {"skill_name": "Button & Zipper Fixing", "category": "technical", "proficiency_level": "intermediate", "is_verified": True},
                {"skill_name": "Customer Fitting Consultation", "category": "soft", "proficiency_level": "basic", "is_verified": False},
                {"skill_name": "Digital Payments (UPI)", "category": "digital", "proficiency_level": "intermediate", "is_verified": True},
            ]
        }
    ]

    seeded_ids = []
    for s in samples:
        user = db.query(User).filter(User.email == s["user_email"]).first()
        if user:
            profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
            if not profile:
                profile = UserProfile(
                    user_id=user.id,
                    education_level=s["education_level"],
                    qualification=s["qualification"],
                    subjects=s["subjects"],
                    experience_years=s["experience_years"],
                    prior_occupation=s["prior_occupation"],
                    livelihood_goal=s["livelihood_goal"],
                    work_preference=s["work_preference"],
                    interests=s["interests"],
                    resources=s["resources"],
                    constraints=s["constraints"],
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)

                for sk in s["skills"]:
                    skill = UserSkill(
                        profile_id=profile.id,
                        skill_name=sk["skill_name"],
                        category=sk["category"],
                        proficiency_level=sk["proficiency_level"],
                        is_verified=sk["is_verified"],
                        source="voice_extracted"
                    )
                    db.add(skill)
                db.commit()
                profile.completion_percentage = calculate_completion_percentage(profile)
                db.commit()
                seeded_ids.append(profile.id)

    return APIResponse(
        success=True,
        message=f"Seeded sample candidate profile(s). Profile IDs: {seeded_ids}",
        data={"profile_ids": seeded_ids}
    )


# -----------------------------------------------------------------------------
# CANDIDATE JOURNEY CONTINUITY, PROGRESS TRACKING & RE-GAP ANALYSIS
# -----------------------------------------------------------------------------

from typing import Optional
from pydantic import BaseModel
from app.models.progress import CandidateProgress, ConsentLog, AuditLog, CandidateFeedback
from app.knowledge.nsqf_catalog import get_nsqf_qualification_by_code
from app.ai.competency_matching.gap_analyzer import analyze_competency_gaps


class EnrollProgressRequest(BaseModel):
    qp_code: str
    training_mode: Optional[str] = "STT"
    centre_id: Optional[str] = None
    centre_name: Optional[str] = None


class CompleteNosRequest(BaseModel):
    qp_code: str
    nos_code: str
    hours_logged: Optional[int] = 10


class VerifyNosRequest(BaseModel):
    qp_code: str
    nos_code: str
    candidate_user_id: int
    notes: Optional[str] = None


class ConsentRequest(BaseModel):
    consent_type: str = "profile_storage"  # "voice_processing", "profile_storage", "training_partner_sharing"
    consent_granted: bool = True
    consent_version: str = "v1.0"


class FeedbackRequest(BaseModel):
    qp_code: Optional[str] = None
    was_useful: bool = True
    did_enrol: bool = False
    rating: int = 5
    comments: Optional[str] = None


@router.get("/progress", response_model=APIResponse)
def get_candidate_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve active training progress, enrolled courses, and completed NOS competencies."""
    progress_records = db.query(CandidateProgress).filter(
        CandidateProgress.user_id == current_user.id
    ).order_by(CandidateProgress.updated_at.desc()).all()

    items = []
    for p in progress_records:
        items.append({
            "id": p.id,
            "qp_code": p.qp_code,
            "qualification_name": p.qualification_name,
            "sector": p.sector,
            "training_mode": p.training_mode,
            "status": p.status,
            "enrolled_centre_id": p.enrolled_centre_id,
            "enrolled_centre_name": p.enrolled_centre_name,
            "completed_nos_codes": p.completed_nos_codes or [],
            "active_nos_codes": p.active_nos_codes or [],
            "bridge_hours_completed": p.bridge_hours_completed,
            "total_bridge_hours": p.total_bridge_hours,
            "progress_percent": round((p.bridge_hours_completed / max(p.total_bridge_hours, 1)) * 100, 1),
            "certificate_id": p.certificate_id,
            "certificate_url": p.certificate_url,
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        })

    return APIResponse(
        success=True,
        message=f"Retrieved {len(items)} training progress records.",
        data=items
    )


@router.post("/progress/enroll", response_model=APIResponse)
def enroll_in_course(
    request: EnrollProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enroll candidate into an NSQF Qualification Pack pathway with chosen training centre."""
    qp = get_nsqf_qualification_by_code(request.qp_code)
    if not qp:
        raise HTTPException(status_code=404, detail=f"Qualification Pack {request.qp_code} not found.")

    existing = db.query(CandidateProgress).filter(
        CandidateProgress.user_id == current_user.id,
        CandidateProgress.qp_code == request.qp_code
    ).first()

    base_hours = int(qp.get("training_duration_hours", 300))
    is_rpl = request.training_mode == "RPL"
    target_hours = 60 if is_rpl else base_hours

    if existing:
        existing.status = "enrolled"
        existing.training_mode = request.training_mode or "STT"
        if request.centre_id:
            existing.enrolled_centre_id = request.centre_id
        if request.centre_name:
            existing.enrolled_centre_name = request.centre_name
        db.commit()
        db.refresh(existing)
        progress_obj = existing
    else:
        # Determine initial active NOS
        first_nos = qp.get("competencies", [{}])[0].get("nos_code", "")
        progress_obj = CandidateProgress(
            user_id=current_user.id,
            qp_code=request.qp_code,
            qualification_name=qp.get("qualification_name", ""),
            sector=qp.get("sector", ""),
            training_mode=request.training_mode or "STT",
            status="enrolled",
            enrolled_centre_id=request.centre_id,
            enrolled_centre_name=request.centre_name,
            completed_nos_codes=[],
            active_nos_codes=[first_nos] if first_nos else [],
            bridge_hours_completed=0,
            total_bridge_hours=target_hours
        )
        db.add(progress_obj)
        db.commit()
        db.refresh(progress_obj)

    # Log action to AuditLog
    audit = AuditLog(
        user_id=current_user.id,
        actor_role="candidate",
        action="enroll_course",
        details={"qp_code": request.qp_code, "centre": request.centre_name, "mode": request.training_mode}
    )
    db.add(audit)
    db.commit()

    return APIResponse(
        success=True,
        message=f"Enrolled successfully in {qp.get('qualification_name')}.",
        data={
            "progress_id": progress_obj.id,
            "qp_code": progress_obj.qp_code,
            "qualification_name": progress_obj.qualification_name,
            "status": progress_obj.status,
            "training_mode": progress_obj.training_mode
        }
    )


@router.post("/progress/complete-nos", response_model=APIResponse)
def complete_nos_module(
    request: CompleteNosRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Self-report an NOS module as complete (status: pending_verification).
    Candidates can only self-report. Actual certification requires
    verification by a training_provider or admin at POST /progress/verify-nos.
    """
    progress = db.query(CandidateProgress).filter(
        CandidateProgress.user_id == current_user.id,
        CandidateProgress.qp_code == request.qp_code
    ).first()

    if not progress:
        raise HTTPException(status_code=404, detail="Enrollment record not found. Please enroll first.")

    # Track hours even for self-reported completions
    progress.bridge_hours_completed = min(
        progress.total_bridge_hours,
        progress.bridge_hours_completed + (request.hours_logged or 10)
    )

    # Track pending NOS codes separately (stored in active_nos_codes with a prefix)
    pending_key = f"pending:{request.nos_code}"
    active = list(progress.active_nos_codes or [])
    if pending_key not in active and request.nos_code not in (progress.completed_nos_codes or []):
        active.append(pending_key)
        progress.active_nos_codes = active

    progress.status = "in_training"
    db.commit()
    db.refresh(progress)

    return APIResponse(
        success=True,
        message=(
            f"NOS {request.nos_code} self-reported as complete (status: pending_verification). "
            "A training provider or admin must verify before it counts toward certification."
        ),
        data={
            "qp_code": progress.qp_code,
            "nos_code": request.nos_code,
            "status": "pending_verification",
            "bridge_hours_completed": progress.bridge_hours_completed,
            "total_bridge_hours": progress.total_bridge_hours,
            "overall_status": progress.status,
        }
    )


def _require_verifier(current_user: User) -> None:
    """Allow training_provider or admin roles to verify NOS completions."""
    if current_user.role not in ("admin", "training_provider", "field_agent"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only training providers, field agents, or admins can verify NOS completions."
        )


@router.post("/progress/verify-nos", response_model=APIResponse)
def verify_nos_module(
    request: VerifyNosRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Officially verify an NOS module completion for a candidate.
    Requires role: training_provider, field_agent, or admin.
    Only verified completions count toward certification.
    Certificate IDs are internal progress certificates only;
    official NCVET/DigiLocker integration is required for real credentials.
    """
    _require_verifier(current_user)

    progress = db.query(CandidateProgress).filter(
        CandidateProgress.user_id == request.candidate_user_id,
        CandidateProgress.qp_code == request.qp_code
    ).first()

    if not progress:
        raise HTTPException(status_code=404, detail="Enrollment record not found for this candidate.")

    # Move from pending to verified
    pending_key = f"pending:{request.nos_code}"
    active = list(progress.active_nos_codes or [])
    if pending_key in active:
        active.remove(pending_key)
        progress.active_nos_codes = active

    completed = list(progress.completed_nos_codes or [])
    if request.nos_code not in completed:
        completed.append(request.nos_code)
        progress.completed_nos_codes = completed

    # Check if all competencies are now verified
    qp = get_nsqf_qualification_by_code(request.qp_code)
    all_nos_codes = [c.get("nos_code") for c in qp.get("competencies", [])] if qp else []
    if all_nos_codes and all(code in completed for code in all_nos_codes):
        progress.status = "certified"
        # Internal progress certificate only.
        # certificate_url stays None until official NCVET/DigiLocker API is integrated.
        progress.certificate_id = f"INTERNAL-PROGRESS-{request.candidate_user_id:04d}-{request.qp_code.replace('/', '')}"
        progress.certificate_url = None
    else:
        progress.status = "in_training"

    # Add newly mastered NOS skills to candidate profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == request.candidate_user_id).first()
    if matched_nos := next((c for c in (qp.get("competencies", []) if qp else []) if c.get("nos_code") == request.nos_code), None):
        if profile:
            for r_skill in matched_nos.get("related_skills", []):
                if not any(s.skill_name.lower() == r_skill.lower() for s in profile.skills):
                    db.add(UserSkill(
                        profile_id=profile.id,
                        skill_name=r_skill,
                        category="technical",
                        proficiency_level="advanced",
                        is_verified=True,
                        source="course_verified"
                    ))

    # Audit the verification action
    from app.services.audit_service import log_audit_event
    log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="verify_nos",
        target_user_id=request.candidate_user_id,
        details={
            "candidate_user_id": request.candidate_user_id,
            "qp_code": request.qp_code,
            "nos_code": request.nos_code,
            "notes": request.notes,
        }
    )
    db.commit()
    db.refresh(progress)

    # Re-run gap analysis with updated skills
    cand_skills = [s.skill_name for s in profile.skills] if profile else []
    fresh_gap = analyze_competency_gaps(cand_skills, request.qp_code)

    return APIResponse(
        success=True,
        message=(
            f"NOS {request.nos_code} verified. "
            + (f"Candidate is now certified ({progress.certificate_id})." if progress.status == 'certified' else "Progress updated.")
        ),
        data={
            "verified_nos_code": request.nos_code,
            "completed_nos_codes": progress.completed_nos_codes,
            "overall_status": progress.status,
            "certificate_id": progress.certificate_id,
            "certificate_url": progress.certificate_url,  # None until official integration
            "certificate_note": (
                "Internal progress certificate only. Official NCVET/DigiLocker credential "
                "requires certification body API integration."
                if progress.certificate_id else None
            ),
            "recomputed_match_score": fresh_gap.get("match_score"),
        }
    )


@router.post("/consent", response_model=APIResponse)
def record_candidate_consent(
    request: ConsentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Records explicit consent for voice data collection, storage, and training partner sharing."""
    consent = ConsentLog(
        user_id=current_user.id,
        phone=current_user.phone,
        consent_type=request.consent_type,
        consent_granted=request.consent_granted,
        consent_version=request.consent_version
    )
    db.add(consent)
    db.commit()

    return APIResponse(
        success=True,
        message=f"Consent '{request.consent_type}' recorded successfully.",
        data={"consent_id": consent.id, "type": consent.consent_type, "granted": consent.consent_granted}
    )


@router.post("/feedback", response_model=APIResponse)
def submit_feedback(
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits candidate feedback to evaluate and continuously improve recommendation quality."""
    fb = CandidateFeedback(
        user_id=current_user.id,
        qp_code=request.qp_code,
        was_useful=request.was_useful,
        did_enrol=request.did_enrol,
        rating=request.rating,
        comments=request.comments
    )
    db.add(fb)
    db.commit()

    return APIResponse(
        success=True,
        message="Thank you! Your feedback has been recorded.",
        data={"feedback_id": fb.id}
    )


# -----------------------------------------------------------------------------
# DATA SUBJECT RIGHTS (DPDP Act 2023 & GDPR Compliance)
# -----------------------------------------------------------------------------

@router.get("/export-data", response_model=APIResponse)
def export_candidate_data(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Data-subject right: Right to Data Portability / Export.
    Returns complete candidate profile, identified competencies, progress logs, and consent history.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    skills = db.query(UserSkill).filter(UserSkill.profile_id == profile.id).all() if profile else []
    progress_records = db.query(CandidateProgress).filter(CandidateProgress.user_id == current_user.id).all()
    consents = db.query(ConsentLog).filter(ConsentLog.user_id == current_user.id).all()
    feedbacks = db.query(CandidateFeedback).filter(CandidateFeedback.user_id == current_user.id).all()

    export_payload = {
        "export_metadata": {
            "platform": "LivelihoodAI / SkillPath AI",
            "compliance_standard": "Digital Personal Data Protection (DPDP) Act 2023 & GDPR",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "user_id": current_user.id,
        },
        "account": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "location": current_user.location,
            "preferred_language": current_user.preferred_language,
            "registered_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "profile": {
            "education_level": profile.education_level if profile else None,
            "qualification": profile.qualification if profile else None,
            "subjects": profile.subjects if profile else [],
            "experience_years": profile.experience_years if profile else 0.0,
            "prior_occupation": profile.prior_occupation if profile else None,
            "livelihood_goal": profile.livelihood_goal if profile else None,
            "work_preference": profile.work_preference if profile else None,
            "interests": profile.interests if profile else [],
            "resources": profile.resources if profile else [],
            "constraints": profile.constraints if profile else [],
            "completion_percentage": profile.completion_percentage if profile else 0,
        },
        "skills": [
            {
                "skill_name": s.skill_name,
                "category": s.category,
                "proficiency_level": s.proficiency_level,
                "is_verified": s.is_verified,
                "source": s.source,
                "verified_at": s.verified_at.isoformat() if s.verified_at else None,
            }
            for s in skills
        ],
        "progress_and_certifications": [
            {
                "qp_code": p.qp_code,
                "qualification_name": p.qualification_name,
                "sector": p.sector,
                "status": p.status,
                "training_mode": p.training_mode,
                "completed_nos_codes": p.completed_nos_codes,
                "bridge_hours_completed": p.bridge_hours_completed,
                "total_bridge_hours": p.total_bridge_hours,
                "certificate_id": p.certificate_id,
            }
            for p in progress_records
        ],
        "consent_history": [
            {
                "consent_type": c.consent_type,
                "granted": c.consent_granted,
                "version": c.consent_version,
                "timestamp": c.timestamp.isoformat() if c.timestamp else None,
            }
            for c in consents
        ],
        "feedback_history": [
            {
                "qp_code": f.qp_code,
                "rating": f.rating,
                "comments": f.comments,
                "timestamp": f.timestamp.isoformat() if f.timestamp else None,
            }
            for f in feedbacks
        ],
    }

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="export_personal_data",
        target_user_id=current_user.id,
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message="Candidate personal data archive generated successfully.",
        data=export_payload
    )


@router.delete("/delete-account", response_model=APIResponse)
def delete_my_account_and_data(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Data-subject right: Right to Erasure / Account Deletion.
    Permanently purges the candidate's account, profile, competencies, and history.
    """
    user_id = current_user.id
    user_ident = current_user.email or current_user.phone or str(user_id)
    client_ip = request.client.host if request.client else None

    # Write audit log prior to cascade deletion
    log_audit_event(
        db=db,
        actor_id=user_id,
        actor_role=current_user.role,
        action="delete_account_and_data",
        target_user_id=user_id,
        details={"identifier": user_ident, "reason": "User invoked data-subject erasure right"},
        ip_address=client_ip
    )

    # Delete profile (cascades UserSkills)
    db.query(UserProfile).filter(UserProfile.user_id == user_id).delete()
    db.query(CandidateProgress).filter(CandidateProgress.user_id == user_id).delete()
    db.query(ConsentLog).filter(ConsentLog.user_id == user_id).delete()
    db.query(CandidateFeedback).filter(CandidateFeedback.user_id == user_id).delete()
    
    # Delete User record
    db.query(User).filter(User.id == user_id).delete()
    db.commit()

    return APIResponse(
        success=True,
        message="Your account and all associated personal data have been permanently erased.",
        data={"deleted_user_id": user_id}
    )


# -----------------------------------------------------------------------------
# DYNAMIC ROUTE - Placed at the end to prevent shadowing static /progress routes
# -----------------------------------------------------------------------------

@router.get("/{profile_id}", response_model=APIResponse)
def get_profile_by_id(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve candidate profile by ID.
    SECURITY: Authorized strictly for profile owner or users with admin role.
    Returns 403 Forbidden for any other authenticated user.
    """
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    # Enforce horizontal authorization / tenant boundary
    if current_user.role != "admin" and profile.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to view another candidate's profile."
        )

    return APIResponse(
        success=True,
        message="Profile retrieved.",
        data=ProfileOut.model_validate(profile).model_dump()
    )

