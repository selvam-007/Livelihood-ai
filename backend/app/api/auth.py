import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserOut,
    AdminCreate,
    PromoteAdminRequest,
    SendOTPRequest,
    VerifyOTPRequest
)
from app.schemas.token import Token
from app.schemas.common import APIResponse
from app.services.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    require_admin
)
from app.services.sms_service import create_and_send_otp, verify_phone_otp, normalize_phone
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new candidate.
    SECURITY: Self-registration strictly creates role='candidate'.
    Administrative, field agent, and training provider privileges can only be provisioned by admins.
    """
    if user_in.email:
        existing = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

    normalized_phone = normalize_phone(user_in.phone) if user_in.phone else None
    if normalized_phone:
        existing_phone = db.query(User).filter(User.phone == normalized_phone).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this mobile phone number already exists."
            )

    if not user_in.email and not normalized_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either an email address or mobile phone number must be provided."
        )

    # Strictly enforce candidate role for self-registration to prevent privilege escalation
    role = "candidate"
    hashed_pwd = get_password_hash(user_in.password) if user_in.password else None

    new_user = User(
        email=user_in.email.lower() if user_in.email else None,
        phone=normalized_phone,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=role,
        preferred_language=user_in.preferred_language or "en",
        location=user_in.location,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically initialize candidate profile
    profile = UserProfile(user_id=new_user.id, completion_percentage=20)
    db.add(profile)
    db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    token_response = Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

    return APIResponse(
        success=True,
        message="Candidate account registered successfully.",
        data=token_response.model_dump()
    )


@router.post("/otp/send", response_model=APIResponse)
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Request SMS verification code for mobile-first candidate login/registration.
    Dispatches via configured SMS gateway (Twilio/MSG91/Simulated).
    """
    success, msg = create_and_send_otp(db, req.phone, req.language or "en")
    if not success:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=msg)

    return APIResponse(
        success=True,
        message=msg,
        data={"phone": normalize_phone(req.phone)}
    )


@router.post("/otp/verify", response_model=APIResponse)
def verify_otp(req: VerifyOTPRequest, request: Request, db: Session = Depends(get_db)):
    """
    Verify SMS OTP code.
    If candidate exists, issues JWT session.
    If phone is new, automatically provisions a new candidate account.
    """
    valid, err = verify_phone_otp(db, req.phone, req.otp)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err)

    normalized_phone = normalize_phone(req.phone)
    user = db.query(User).filter(User.phone == normalized_phone).first()

    is_new = False
    if not user:
        is_new = True
        user = User(
            phone=normalized_phone,
            full_name=req.full_name or f"Candidate {normalized_phone[-4:]}",
            role="candidate",
            preferred_language=req.preferred_language or "en",
            location=req.location,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Initialize profile
        profile = UserProfile(user_id=user.id, completion_percentage=25)
        db.add(profile)
        db.commit()

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account has been deactivated.")

    # Audit log entry
    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_role=user.role,
        action="otp_login" if not is_new else "otp_register",
        target_user_id=user.id,
        details={"phone": normalized_phone, "is_new_registration": is_new},
        ip_address=client_ip
    )

    token = create_access_token(subject=user.id, role=user.role)
    token_response = Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

    return APIResponse(
        success=True,
        message="Mobile OTP verified successfully." if not is_new else "Candidate account registered via OTP.",
        data=token_response.model_dump()
    )


@router.post("/login", response_model=APIResponse)
def login_user(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate with email/phone and password to receive JWT access token."""
    user = None
    if credentials.email:
        user = db.query(User).filter(User.email == credentials.email.lower()).first()
    elif credentials.phone:
        normalized_phone = normalize_phone(credentials.phone)
        user = db.query(User).filter(User.phone == normalized_phone).first()

    if not user or not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated."
        )

    # If this is the configured administrator email, guarantee admin privileges
    admin_email = os.getenv("ADMIN_EMAIL", "admin@livelihood.ai").lower()
    if user.email and user.email.lower() == admin_email and user.role != "admin":
        user.role = "admin"
        db.commit()
        db.refresh(user)

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=user.id,
        actor_role=user.role,
        action="password_login",
        target_user_id=user.id,
        ip_address=client_ip
    )

    token = create_access_token(subject=user.id, role=user.role)
    token_response = Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

    return APIResponse(
        success=True,
        message="Authentication successful.",
        data=token_response.model_dump()
    )


@router.post("/create-admin", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    admin_in: AdminCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint: Provision a new administrator account.
    Protected strictly by require_admin.
    """
    existing = db.query(User).filter(User.email == admin_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    new_admin = User(
        email=admin_in.email.lower(),
        hashed_password=get_password_hash(admin_in.password),
        full_name=admin_in.full_name,
        role="admin",
        phone=admin_in.phone,
        preferred_language=admin_in.preferred_language or "en",
        location=admin_in.location,
        is_active=True
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    log_audit_event(
        db=db,
        actor_id=admin_user.id,
        actor_role="admin",
        action="provision_admin",
        target_user_id=new_admin.id,
        details={"email": new_admin.email}
    )

    return APIResponse(
        success=True,
        message="Administrator account provisioned successfully.",
        data=UserOut.model_validate(new_admin).model_dump()
    )


@router.post("/promote-user", response_model=APIResponse)
def promote_user_role(
    req: PromoteAdminRequest,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint: Promote or change an existing user's role to admin, field_agent, or training_provider.
    """
    valid_roles = {"admin", "field_agent", "training_provider", "candidate"}
    target_role = req.role or "admin"
    if target_role not in valid_roles:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role. Must be one of: {valid_roles}")

    query = db.query(User)
    if req.user_id:
        user = query.filter(User.id == req.user_id).first()
    elif req.email:
        user = query.filter(User.email == req.email.lower()).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either user_id or email must be provided."
        )

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    old_role = user.role
    user.role = target_role
    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        actor_id=admin_user.id,
        actor_role="admin",
        action="promote_user_role",
        target_user_id=user.id,
        details={"previous_role": old_role, "new_role": target_role}
    )

    return APIResponse(
        success=True,
        message=f"User {user.email or user.phone} role changed from '{old_role}' to '{target_role}'.",
        data=UserOut.model_validate(user).model_dump()
    )


@router.get("/me", response_model=APIResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Fetch profile of currently authenticated user."""
    return APIResponse(
        success=True,
        message="User profile retrieved.",
        data=UserOut.model_validate(current_user).model_dump()
    )


@router.post("/seed-demo-users", response_model=APIResponse)
def seed_demo_users(db: Session = Depends(get_db)):
    """
    Seeds standard evaluation accounts for all 4 roles: candidate, field_agent, training_provider, admin.
    Strictly disabled in production environments.
    """
    if not settings.ALLOW_DEMO_SEEDING or settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo account seeding is disabled in production environments."
        )

    default_pwd = os.getenv("DEMO_PASSWORD", "Password123!")

    demo_accounts = [
        {
            "email": "candidate@livelihood.ai",
            "password": default_pwd,
            "full_name": "Lakshmi Priya",
            "role": "candidate",
            "phone": "+919876543210",
            "location": "Madurai, Tamil Nadu",
            "preferred_language": "ta"
        },
        {
            "email": "agent@livelihood.ai",
            "password": default_pwd,
            "full_name": "Ramesh Kumar (Field Agent)",
            "role": "field_agent",
            "phone": "+919876543211",
            "location": "Tiruchirappalli, Tamil Nadu",
            "preferred_language": "ta"
        },
        {
            "email": "provider@livelihood.ai",
            "password": default_pwd,
            "full_name": "PMKK Skill Centre Manager",
            "role": "training_provider",
            "phone": "+919876543212",
            "location": "Chennai, Tamil Nadu",
            "organisation_name": "Pradhan Mantri Kaushal Kendra - Guindy",
            "preferred_language": "en"
        },
        {
            "email": "admin@livelihood.ai",
            "password": default_pwd,
            "full_name": "State Skilling Administrator",
            "role": "admin",
            "phone": "+919876543213",
            "location": "Chennai, Tamil Nadu",
            "preferred_language": "en"
        }
    ]

    created = []
    for acc in demo_accounts:
        user = db.query(User).filter(User.email == acc["email"]).first()
        if not user:
            user = User(
                email=acc["email"],
                hashed_password=get_password_hash(acc["password"]),
                full_name=acc["full_name"],
                role=acc["role"],
                phone=acc.get("phone"),
                location=acc.get("location"),
                organisation_name=acc.get("organisation_name"),
                preferred_language=acc.get("preferred_language", "en"),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            if acc["role"] == "candidate":
                profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
                if not profile:
                    profile = UserProfile(
                        user_id=user.id,
                        education_level="12th Standard",
                        prior_occupation="Tailoring & Sewing",
                        experience_years=2.5,
                        livelihood_goal="self-employment",
                        completion_percentage=85
                    )
                    db.add(profile)
                    db.commit()

            created.append(acc["email"])

    return APIResponse(
        success=True,
        message=f"Seeded {len(created)} demo account(s) across all roles.",
        data={"seeded_emails": created}
    )
