from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.common import APIResponse
from app.models.user import User
from app.models.profile import UserProfile, UserSkill
from app.models.progress import AuditLog
from app.services.admin_service import get_aggregate_admin_analytics
from app.services.security import get_password_hash, require_admin
from app.config import settings

router = APIRouter(prefix="/admin", tags=["Administrative & State Skilling Intelligence"])


@router.get("/analytics", response_model=APIResponse)
def get_admin_dashboard_metrics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Retrieve aggregated, privacy-safe livelihood intelligence metrics.
    Strictly scrubs personal individual identities (PII) per Section 15 & 23.
    Protected strictly by require_admin.
    """
    analytics = get_aggregate_admin_analytics(db)
    return APIResponse(
        success=True,
        message="Administrative intelligence analytics generated successfully.",
        data=analytics
    )


@router.get("/audit-logs", response_model=APIResponse)
def get_audit_logs(
    actor_role: Optional[str] = Query(None, description="Filter by actor role (admin, field_agent, training_provider, candidate)"),
    action: Optional[str] = Query(None, description="Filter by action name"),
    target_user_id: Optional[int] = Query(None, description="Filter by target user ID"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint: Retrieve system audit log trails for security, DPDP compliance, and agent oversight.
    """
    query = db.query(AuditLog)
    if actor_role:
        query = query.filter(AuditLog.actor_role == actor_role)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if target_user_id:
        query = query.filter(AuditLog.target_user_id == target_user_id)

    total = query.count()
    logs = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()

    result = [
        {
            "id": log.id,
            "actor_id": log.actor_id,
            "actor_role": log.actor_role,
            "action": log.action,
            "target_user_id": log.target_user_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in logs
    ]

    return APIResponse(
        success=True,
        message=f"Retrieved {len(result)} audit log entries (total: {total}).",
        data={"total": total, "logs": result}
    )


@router.post("/seed-synthetic-data", response_model=APIResponse)
def seed_hackathon_synthetic_candidates(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Seeds realistic synthetic candidate records across Tamil Nadu districts
    for the SIH evaluation demonstration (Section 24).
    Protected strictly by require_admin and disabled in production environments.
    """
    if not settings.ALLOW_DEMO_SEEDING or settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Synthetic data seeding is disabled in production environments."
        )
    synthetic_profiles = [
        # User A: Tailoring background
        {
            "email": "cand_madurai_01@sih-synthetic.ai",
            "full_name": "Deepa R.",
            "location": "Madurai, Tamil Nadu",
            "education": "12th Standard",
            "occupation": "Tailoring Assistant",
            "experience_years": 2.0,
            "goal": "self-employment",
            "resources": ["Sewing machine", "Smartphone"],
            "skills": ["Basic Machine Stitching", "Fabric Cutting & Marking", "Button & Fastener Fixing"]
        },
        # User B: Electrical background
        {
            "email": "cand_coimbatore_02@sih-synthetic.ai",
            "full_name": "Senthil K.",
            "location": "Coimbatore, Tamil Nadu",
            "education": "10th Standard",
            "occupation": "Electrician Apprentice",
            "experience_years": 1.5,
            "goal": "employment",
            "resources": ["Tool set", "Multimeter"],
            "skills": ["Domestic Electrical Wiring", "Switchboard Installation & Testing"]
        },
        # User C: IT/Diploma background
        {
            "email": "cand_trichy_03@sih-synthetic.ai",
            "full_name": "Ananya S.",
            "location": "Tiruchirappalli, Tamil Nadu",
            "education": "Diploma in Computer Applications",
            "occupation": "Data Operator",
            "experience_years": 1.0,
            "goal": "employment",
            "resources": ["Home PC", "Broadband internet"],
            "skills": ["Spreadsheet Management & Formulas", "Data Entry & Document Processing", "Digital Payments & UPI Transactions"]
        },
        # User D: Solar PV background
        {
            "email": "cand_tirunelveli_04@sih-synthetic.ai",
            "full_name": "Muthu P.",
            "location": "Tirunelveli, Tamil Nadu",
            "education": "10th Standard",
            "occupation": "Solar Helper",
            "experience_years": 0.5,
            "goal": "employment",
            "resources": ["Hand tools", "Safety boots"],
            "skills": ["Solar PV Panel Assembly & Mounting", "Domestic Electrical Wiring"]
        }
    ]

    seeded_count = 0
    for cand in synthetic_profiles:
        existing = db.query(User).filter(User.email == cand["email"]).first()
        if not existing:
            user = User(
                email=cand["email"],
                hashed_password=get_password_hash("SyntheticPassword123!"),
                full_name=cand["full_name"],
                role="candidate",
                location=cand["location"],
                preferred_language="ta",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            profile = UserProfile(
                user_id=user.id,
                education_level=cand["education"],
                prior_occupation=cand["occupation"],
                experience_years=cand["experience_years"],
                livelihood_goal=cand["goal"],
                resources=cand["resources"],
                completion_percentage=85
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

            for sk in cand["skills"]:
                user_skill = UserSkill(
                    profile_id=profile.id,
                    skill_name=sk,
                    category="technical",
                    proficiency_level="intermediate",
                    is_verified=True,
                    source="voice_extracted"
                )
                db.add(user_skill)
            db.commit()
            seeded_count += 1

    return APIResponse(
        success=True,
        message=f"Seeded {seeded_count} synthetic candidate profiles for SIH demonstration.",
        data={"seeded_count": seeded_count}
    )
