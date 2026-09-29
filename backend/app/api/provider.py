import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.provider import TrainingBatch, BatchEnrollment
from app.models.progress import CandidateProgress
from app.schemas.common import APIResponse
from app.schemas.user import TrainingBatchCreate, AttendanceUpdateRequest, BatchCompletionRequest
from app.services.security import require_training_provider
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/provider", tags=["Training Provider & Batch Management"])


def utc_now():
    return datetime.now(timezone.utc)


@router.get("/batches", response_model=APIResponse)
def list_batches(
    provider: User = Depends(require_training_provider),
    db: Session = Depends(get_db)
):
    """List all training batches managed by this training provider."""
    query = db.query(TrainingBatch)
    if provider.role != "admin":
        query = query.filter(TrainingBatch.provider_id == provider.id)

    batches = query.order_by(TrainingBatch.created_at.desc()).all()

    result = []
    for b in batches:
        enrolled_count = db.query(BatchEnrollment).filter(BatchEnrollment.batch_id == b.id).count()
        result.append({
            "id": b.id,
            "batch_name": b.batch_name,
            "qp_code": b.qp_code,
            "qualification_name": b.qualification_name,
            "centre_name": b.centre_name,
            "start_date": b.start_date,
            "end_date": b.end_date,
            "max_capacity": b.max_capacity,
            "enrolled_count": enrolled_count,
            "is_active": b.is_active,
            "created_at": b.created_at
        })

    return APIResponse(
        success=True,
        message=f"Retrieved {len(result)} training batch(es).",
        data=result
    )


@router.post("/batches", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_in: TrainingBatchCreate,
    request: Request,
    provider: User = Depends(require_training_provider),
    db: Session = Depends(get_db)
):
    """Create a new training batch for an NSQF Qualification Pack."""
    new_batch = TrainingBatch(
        provider_id=provider.id,
        batch_name=batch_in.batch_name,
        qp_code=batch_in.qp_code,
        qualification_name=batch_in.qualification_name or batch_in.qp_code,
        centre_name=batch_in.centre_name,
        start_date=batch_in.start_date,
        end_date=batch_in.end_date,
        max_capacity=batch_in.max_capacity,
        is_active=True
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=provider.id,
        actor_role=provider.role,
        action="create_training_batch",
        details={"batch_id": new_batch.id, "batch_name": new_batch.batch_name, "qp_code": new_batch.qp_code},
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message=f"Training batch '{new_batch.batch_name}' created successfully.",
        data={"batch_id": new_batch.id, "batch_name": new_batch.batch_name}
    )


@router.get("/enrollments", response_model=APIResponse)
def list_enrollments(
    batch_id: Optional[int] = None,
    provider: User = Depends(require_training_provider),
    db: Session = Depends(get_db)
):
    """List all enrolled candidates across batches, with attendance and certification status."""
    query = db.query(BatchEnrollment).join(TrainingBatch)
    if provider.role != "admin":
        query = query.filter(TrainingBatch.provider_id == provider.id)

    if batch_id:
        query = query.filter(BatchEnrollment.batch_id == batch_id)

    enrollments = query.order_by(BatchEnrollment.created_at.desc()).all()

    result = []
    for enr in enrollments:
        candidate = db.query(User).filter(User.id == enr.candidate_id).first()
        batch = enr.batch
        result.append({
            "enrollment_id": enr.id,
            "batch_id": enr.batch_id,
            "batch_name": batch.batch_name if batch else "Unknown",
            "qp_code": batch.qp_code if batch else "",
            "candidate_id": enr.candidate_id,
            "candidate_name": candidate.full_name if candidate else "Candidate",
            "candidate_phone": candidate.phone if candidate else "",
            "candidate_email": candidate.email if candidate else "",
            "attendance_percentage": enr.attendance_percentage,
            "status": enr.status,
            "certificate_id": enr.certificate_id,
            "completion_date": enr.completion_date,
            "notes": enr.notes,
            "created_at": enr.created_at
        })

    return APIResponse(
        success=True,
        message=f"Retrieved {len(result)} enrollment record(s).",
        data=result
    )


@router.post("/enrollments/{enrollment_id}/attendance", response_model=APIResponse)
def update_candidate_attendance(
    enrollment_id: int,
    req: AttendanceUpdateRequest,
    request: Request,
    provider: User = Depends(require_training_provider),
    db: Session = Depends(get_db)
):
    """Log or update daily attendance and overall completion percentage for an enrolled candidate."""
    enrollment = db.query(BatchEnrollment).filter(BatchEnrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found.")

    records = list(enrollment.attendance_records or [])
    # Update or append date
    existing_idx = next((i for i, r in enumerate(records) if r.get("date") == req.date), None)
    if existing_idx is not None:
        records[existing_idx] = {"date": req.date, "present": req.present, "notes": req.notes}
    else:
        records.append({"date": req.date, "present": req.present, "notes": req.notes})

    enrollment.attendance_records = records

    # Recompute attendance percentage
    total_days = len(records)
    present_days = sum(1 for r in records if r.get("present"))
    computed_pct = round((present_days / total_days) * 100, 1) if total_days > 0 else 0.0
    enrollment.attendance_percentage = req.attendance_percentage if req.attendance_percentage is not None else computed_pct

    if enrollment.attendance_percentage > 0 and enrollment.status == "enrolled":
        enrollment.status = "in_training"

    db.commit()

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=provider.id,
        actor_role=provider.role,
        action="update_attendance",
        target_user_id=enrollment.candidate_id,
        details={"enrollment_id": enrollment_id, "date": req.date, "present": req.present, "attendance_pct": enrollment.attendance_percentage},
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message=f"Attendance logged for date {req.date}. Current rate: {enrollment.attendance_percentage}%.",
        data={"enrollment_id": enrollment.id, "attendance_percentage": enrollment.attendance_percentage, "status": enrollment.status}
    )


@router.post("/enrollments/{enrollment_id}/complete", response_model=APIResponse)
def mark_candidate_completion(
    enrollment_id: int,
    req: BatchCompletionRequest,
    request: Request,
    provider: User = Depends(require_training_provider),
    db: Session = Depends(get_db)
):
    """
    Authorized training provider marks candidate course completion or NSQF certification.
    Generates official certificate credential ID.
    """
    enrollment = db.query(BatchEnrollment).filter(BatchEnrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found.")

    cert_id = req.certificate_id or f"CERT-NCVET-{uuid.uuid4().hex[:8].upper()}"
    enrollment.status = req.status
    enrollment.certificate_id = cert_id
    enrollment.completion_date = utc_now()
    if req.notes:
        enrollment.notes = req.notes

    # Synchronize CandidateProgress record
    candidate_prog = db.query(CandidateProgress).filter(
        CandidateProgress.user_id == enrollment.candidate_id,
        CandidateProgress.qp_code == enrollment.batch.qp_code
    ).first()

    if candidate_prog:
        candidate_prog.status = req.status
        candidate_prog.certificate_id = cert_id
        candidate_prog.bridge_hours_completed = candidate_prog.total_bridge_hours

    db.commit()

    client_ip = request.client.host if request.client else None
    log_audit_event(
        db=db,
        actor_id=provider.id,
        actor_role=provider.role,
        action="mark_course_completion",
        target_user_id=enrollment.candidate_id,
        details={"enrollment_id": enrollment_id, "status": req.status, "certificate_id": cert_id},
        ip_address=client_ip
    )

    return APIResponse(
        success=True,
        message=f"Candidate marked as '{req.status}' with Certificate ID: {cert_id}.",
        data={"enrollment_id": enrollment.id, "status": enrollment.status, "certificate_id": cert_id}
    )
