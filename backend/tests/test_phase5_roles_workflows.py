import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import get_db
from app.models.user import User
from app.models.profile import UserProfile, UserSkill
from app.models.provider import TrainingBatch, BatchEnrollment
from app.models.progress import AuditLog
from app.services.security import get_password_hash, create_access_token

client = TestClient(app)


@pytest.fixture(autouse=True)
def seed_test_database(db: Session = None):
    """Seed test accounts with each of the 4 roles."""
    # Ensure tables exist
    from app.database.base import Base
    from app.database.session import engine, SessionLocal
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        # Create candidate
        if not session.query(User).filter(User.email == "test_cand@livelihood.ai").first():
            cand = User(
                email="test_cand@livelihood.ai",
                phone="+919876543201",
                hashed_password=get_password_hash("Password123!"),
                full_name="Candidate Tester",
                role="candidate",
                is_active=True
            )
            session.add(cand)
            session.commit()
            session.refresh(cand)

            profile = UserProfile(user_id=cand.id, education_level="12th Standard", completion_percentage=50)
            session.add(profile)
            session.commit()

        # Create field agent
        if not session.query(User).filter(User.email == "test_agent@livelihood.ai").first():
            agent = User(
                email="test_agent@livelihood.ai",
                phone="+919876543202",
                hashed_password=get_password_hash("Password123!"),
                full_name="Agent Tester",
                role="field_agent",
                is_active=True
            )
            session.add(agent)
            session.commit()

        # Create training provider
        if not session.query(User).filter(User.email == "test_provider@livelihood.ai").first():
            provider = User(
                email="test_provider@livelihood.ai",
                phone="+919876543203",
                hashed_password=get_password_hash("Password123!"),
                full_name="Provider Tester",
                role="training_provider",
                organisation_name="PMKK Skill Hub",
                is_active=True
            )
            session.add(provider)
            session.commit()

        # Create admin
        if not session.query(User).filter(User.email == "test_admin@livelihood.ai").first():
            admin = User(
                email="test_admin@livelihood.ai",
                phone="+919876543204",
                hashed_password=get_password_hash("Password123!"),
                full_name="Admin Tester",
                role="admin",
                is_active=True
            )
            session.add(admin)
            session.commit()

    finally:
        session.close()


def get_auth_header(email: str, role: str) -> dict:
    from app.database.session import SessionLocal
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.email == email).first()
        token = create_access_token(subject=user.id, role=role)
        return {"Authorization": f"Bearer {token}"}
    finally:
        session.close()


# ---------------------------------------------------------------------------
# 1. Role-Based Access Control Tests
# ---------------------------------------------------------------------------

def test_candidate_cannot_access_agent_or_admin_endpoints():
    cand_header = get_auth_header("test_cand@livelihood.ai", "candidate")

    # Accessing agent endpoint
    res_agent = client.get("/api/v1/agent/beneficiaries", headers=cand_header)
    assert res_agent.status_code == 403

    # Accessing provider endpoint
    res_prov = client.get("/api/v1/provider/batches", headers=cand_header)
    assert res_prov.status_code == 403

    # Accessing admin endpoint
    res_admin = client.get("/api/v1/admin/analytics", headers=cand_header)
    assert res_admin.status_code == 403


def test_field_agent_can_access_agent_endpoints():
    agent_header = get_auth_header("test_agent@livelihood.ai", "field_agent")

    res = client.get("/api/v1/agent/beneficiaries", headers=agent_header)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # But cannot access admin analytics
    res_admin = client.get("/api/v1/admin/analytics", headers=agent_header)
    assert res_admin.status_code == 403


def test_training_provider_can_access_provider_endpoints():
    provider_header = get_auth_header("test_provider@livelihood.ai", "training_provider")

    res = client.get("/api/v1/provider/batches", headers=provider_header)
    assert res.status_code == 200
    assert res.json()["success"] is True

    # But cannot access admin analytics
    res_admin = client.get("/api/v1/admin/analytics", headers=provider_header)
    assert res_admin.status_code == 403


def test_admin_can_access_all_endpoints():
    admin_header = get_auth_header("test_admin@livelihood.ai", "admin")

    res_admin = client.get("/api/v1/admin/analytics", headers=admin_header)
    assert res_admin.status_code == 200

    res_agent = client.get("/api/v1/agent/beneficiaries", headers=admin_header)
    assert res_agent.status_code == 200

    res_prov = client.get("/api/v1/provider/batches", headers=admin_header)
    assert res_prov.status_code == 200


# ---------------------------------------------------------------------------
# 2. Phone OTP Authentication Tests
# ---------------------------------------------------------------------------

def test_send_and_verify_phone_otp():
    test_phone = "+919876500111"

    # Step 1: Send OTP
    res_send = client.post("/api/v1/auth/otp/send", json={"phone": test_phone, "language": "en"})
    assert res_send.status_code == 200
    assert res_send.json()["success"] is True

    # Retrieve OTP from DB
    from app.database.session import SessionLocal
    from app.models.otp import OTPVerification
    session = SessionLocal()
    try:
        otp_rec = session.query(OTPVerification).filter(OTPVerification.phone == test_phone).order_by(OTPVerification.created_at.desc()).first()
        assert otp_rec is not None
        otp_code = otp_rec.otp_code
    finally:
        session.close()

    # Step 2: Verify OTP
    res_verify = client.post("/api/v1/auth/otp/verify", json={
        "phone": test_phone,
        "otp": otp_code,
        "full_name": "OTP Test User",
        "preferred_language": "ta"
    })
    assert res_verify.status_code == 200
    data = res_verify.json()["data"]
    assert "access_token" in data
    assert data["user"]["phone"] == test_phone
    assert data["user"]["role"] == "candidate"


# ---------------------------------------------------------------------------
# 3. Field Agent Workflow Tests
# ---------------------------------------------------------------------------

def test_field_agent_register_and_verify_beneficiary():
    agent_header = get_auth_header("test_agent@livelihood.ai", "field_agent")

    import time
    unique_phone = f"+9198{int(time.time()*1000)%100000000:08d}"
    bene_payload = {
        "full_name": "Muthu Grassroots",
        "phone": unique_phone,
        "education": "8th Standard",
        "prior_occupation": "Carpentry",
        "livelihood_goal": "self-employment",
        "initial_skills": ["Hand Plane Usage", "Wood Joint Assembly"]
    }
    res_reg = client.post("/api/v1/agent/beneficiaries", json=bene_payload, headers=agent_header)
    assert res_reg.status_code == 201
    candidate_id = res_reg.json()["data"]["candidate_id"]

    # 2. Verify skill
    verify_payload = {
        "skill_name": "Wood Joint Assembly",
        "proficiency_level": "advanced",
        "is_verified": True,
        "verification_notes": "Tested tenon and mortise joint in workshop"
    }
    res_verify = client.post(f"/api/v1/agent/beneficiaries/{candidate_id}/verify-skill", json=verify_payload, headers=agent_header)
    assert res_verify.status_code == 200
    assert res_verify.json()["data"]["is_verified"] is True

    # 3. Run assisted voice interview
    interview_payload = {
        "extracted_skills": ["Measurement Accuracy", "Safety Goggle Protocol"]
    }
    res_interview = client.post(f"/api/v1/agent/beneficiaries/{candidate_id}/voice-interview", json=interview_payload, headers=agent_header)
    assert res_interview.status_code == 200

    # 4. View beneficiary list
    res_list = client.get("/api/v1/agent/beneficiaries", headers=agent_header)
    assert res_list.status_code == 200
    names = [b["full_name"] for b in res_list.json()["data"]]
    assert "Muthu Grassroots" in names


# ---------------------------------------------------------------------------
# 4. Training Provider Workflow Tests
# ---------------------------------------------------------------------------

def test_training_provider_batch_and_attendance():
    prov_header = get_auth_header("test_provider@livelihood.ai", "training_provider")

    # 1. Create batch
    batch_payload = {
        "batch_name": "Batch-2026-Apparel-01",
        "qp_code": "AMH/Q1947",
        "qualification_name": "Self Employed Tailor",
        "centre_name": "PMKK Skill Centre - Guindy",
        "start_date": "2026-10-01",
        "end_date": "2026-12-31",
        "max_capacity": 25
    }
    res_batch = client.post("/api/v1/provider/batches", json=batch_payload, headers=prov_header)
    assert res_batch.status_code == 201
    batch_id = res_batch.json()["data"]["batch_id"]

    # Enroll candidate into batch
    from app.database.session import SessionLocal
    session = SessionLocal()
    try:
        cand = session.query(User).filter(User.email == "test_cand@livelihood.ai").first()
        enrollment = BatchEnrollment(
            batch_id=batch_id,
            candidate_id=cand.id,
            attendance_percentage=0.0,
            status="enrolled"
        )
        session.add(enrollment)
        session.commit()
        session.refresh(enrollment)
        enrollment_id = enrollment.id
    finally:
        session.close()

    # 2. Log attendance
    att_payload = {
        "date": "2026-10-02",
        "present": True,
        "attendance_percentage": 90.0,
        "notes": "Practical cutting demo completed"
    }
    res_att = client.post(f"/api/v1/provider/enrollments/{enrollment_id}/attendance", json=att_payload, headers=prov_header)
    assert res_att.status_code == 200
    assert res_att.json()["data"]["attendance_percentage"] == 90.0

    # 3. Mark completion
    comp_payload = {
        "status": "certified",
        "certificate_id": "CERT-NCVET-TEST-001"
    }
    res_comp = client.post(f"/api/v1/provider/enrollments/{enrollment_id}/complete", json=comp_payload, headers=prov_header)
    assert res_comp.status_code == 200
    assert res_comp.json()["data"]["status"] == "certified"


# ---------------------------------------------------------------------------
# 5. Data Subject Rights & Audit Log Tests
# ---------------------------------------------------------------------------

def test_data_subject_export_and_delete():
    # Create dedicated user for deletion test
    from app.database.session import SessionLocal
    session = SessionLocal()
    try:
        del_user = User(
            email="delete_me@livelihood.ai",
            phone="+919876599999",
            hashed_password=get_password_hash("Password123!"),
            full_name="Ephemeral Candidate",
            role="candidate",
            is_active=True
        )
        session.add(del_user)
        session.commit()
        session.refresh(del_user)
        user_id = del_user.id

        prof = UserProfile(user_id=user_id, education_level="Graduate")
        session.add(prof)
        session.commit()
    finally:
        session.close()

    del_header = get_auth_header("delete_me@livelihood.ai", "candidate")

    # 1. Export data
    res_export = client.get("/api/v1/profile/export-data", headers=del_header)
    assert res_export.status_code == 200
    exp_data = res_export.json()["data"]
    assert exp_data["account"]["email"] == "delete_me@livelihood.ai"
    assert "compliance_standard" in exp_data["export_metadata"]

    # 2. Delete account
    res_del = client.delete("/api/v1/profile/delete-account", headers=del_header)
    assert res_del.status_code == 200
    assert res_del.json()["data"]["deleted_user_id"] == user_id

    # Verify user record is erased
    session = SessionLocal()
    try:
        assert session.query(User).filter(User.id == user_id).first() is None
        assert session.query(UserProfile).filter(UserProfile.user_id == user_id).first() is None
    finally:
        session.close()


def test_admin_audit_logs():
    admin_header = get_auth_header("test_admin@livelihood.ai", "admin")

    res = client.get("/api/v1/admin/audit-logs", headers=admin_header)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "logs" in data
    assert len(data["logs"]) > 0
