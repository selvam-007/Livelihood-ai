"""
Admin CRUD endpoints for catalog tables:
  - QualificationPacks  (/admin/catalog/qps)
  - GovernmentSchemes   (/admin/catalog/schemes)
  - TrainingCentres     (/admin/catalog/training-centres)

All endpoints require admin role.
Soft-deletes set is_active=False rather than removing rows.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.models.catalog import QualificationPack, NOSModule, GovernmentScheme, TrainingCentre
from app.models.user import User
from app.services.security import require_admin
from app.schemas.common import APIResponse

router = APIRouter(prefix="/admin/catalog", tags=["Admin — Catalog CRUD"])


# ---------------------------------------------------------------------------
# Pydantic schemas (thin — just what admin needs to patch/create)
# ---------------------------------------------------------------------------

class QPUpdate(BaseModel):
    qualification_name: Optional[str] = None
    nsqf_level: Optional[str] = None
    sector: Optional[str] = None
    council: Optional[str] = None
    min_education: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    is_active: Optional[bool] = None


class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    ministry: Optional[str] = None
    primary_benefit: Optional[str] = None
    stipend_reward: Optional[str] = None
    eligibility_summary: Optional[str] = None
    application_url: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_education_code: Optional[str] = None
    max_income_annual: Optional[int] = None
    requires_rural: Optional[bool] = None
    source_url: Optional[str] = None
    is_active: Optional[bool] = None


class CentreUpdate(BaseModel):
    name: Optional[str] = None
    centre_type: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    available_seats: Optional[int] = None
    next_batch_date: Optional[str] = None
    official_portal: Optional[str] = None
    source_url: Optional[str] = None
    is_active: Optional[bool] = None


# ---------------------------------------------------------------------------
# Qualification Packs
# ---------------------------------------------------------------------------

@router.get("/qps", response_model=APIResponse)
def list_qps(
    sector: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List QualificationPacks with optional sector filter and pagination."""
    q = db.query(QualificationPack)
    if active_only:
        q = q.filter(QualificationPack.is_active == True)
    if sector:
        q = q.filter(QualificationPack.sector.ilike(f"%{sector}%"))
    total = q.count()
    rows = q.offset(skip).limit(limit).all()
    return APIResponse(
        success=True,
        message=f"{len(rows)} qualification packs returned (total {total}).",
        data={
            "total": total,
            "skip": skip,
            "limit": limit,
            "items": [
                {
                    "id": r.id, "qp_code": r.qp_code,
                    "qualification_name": r.qualification_name,
                    "nsqf_level": r.nsqf_level, "sector": r.sector,
                    "is_active": r.is_active, "source_url": r.source_url,
                    "last_verified_at": r.last_verified_at.isoformat() if r.last_verified_at else None,
                }
                for r in rows
            ],
        },
    )


@router.get("/qps/{qp_code}", response_model=APIResponse)
def get_qp(
    qp_code: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Retrieve a single QualificationPack by QP code."""
    row = db.query(QualificationPack).filter_by(qp_code=qp_code).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"QP '{qp_code}' not found.")
    nos = db.query(NOSModule).filter_by(qp_id=row.id).all()
    return APIResponse(
        success=True,
        message="Qualification pack retrieved.",
        data={
            "id": row.id, "qp_code": row.qp_code,
            "qualification_name": row.qualification_name,
            "nsqf_level": row.nsqf_level, "sector": row.sector,
            "council": row.council, "min_education": row.min_education,
            "description": row.description, "is_active": row.is_active,
            "source_url": row.source_url,
            "last_verified_at": row.last_verified_at.isoformat() if row.last_verified_at else None,
            "nos_modules": [
                {"nos_code": n.nos_code, "title": n.title,
                 "urgency": n.urgency, "criticality": n.criticality}
                for n in nos
            ],
        },
    )


@router.put("/qps/{qp_code}", response_model=APIResponse)
def update_qp(
    qp_code: str,
    body: QPUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update fields on a QualificationPack."""
    row = db.query(QualificationPack).filter_by(qp_code=qp_code).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"QP '{qp_code}' not found.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return APIResponse(success=True, message=f"QP '{qp_code}' updated.", data={"qp_code": qp_code})


@router.delete("/qps/{qp_code}", response_model=APIResponse)
def deactivate_qp(
    qp_code: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete a QualificationPack (sets is_active=False)."""
    row = db.query(QualificationPack).filter_by(qp_code=qp_code).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"QP '{qp_code}' not found.")
    row.is_active = False
    db.commit()
    return APIResponse(success=True, message=f"QP '{qp_code}' deactivated (soft-deleted).", data={})


# ---------------------------------------------------------------------------
# Government Schemes
# ---------------------------------------------------------------------------

@router.get("/schemes", response_model=APIResponse)
def list_schemes(
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all government schemes."""
    q = db.query(GovernmentScheme)
    if active_only:
        q = q.filter(GovernmentScheme.is_active == True)
    total = q.count()
    rows = q.offset(skip).limit(limit).all()
    return APIResponse(
        success=True,
        message=f"{len(rows)} schemes returned.",
        data={
            "total": total,
            "items": [
                {
                    "id": r.id, "scheme_code": r.scheme_code, "name": r.name,
                    "ministry": r.ministry, "is_active": r.is_active,
                    "application_url": r.application_url,
                    "source_url": r.source_url,
                }
                for r in rows
            ],
        },
    )


@router.put("/schemes/{scheme_code}", response_model=APIResponse)
def update_scheme(
    scheme_code: str,
    body: SchemeUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a government scheme record."""
    row = db.query(GovernmentScheme).filter_by(scheme_code=scheme_code).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_code}' not found.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(row, field, value)
    db.commit()
    return APIResponse(success=True, message=f"Scheme '{scheme_code}' updated.", data={})


@router.delete("/schemes/{scheme_code}", response_model=APIResponse)
def deactivate_scheme(
    scheme_code: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete a scheme."""
    row = db.query(GovernmentScheme).filter_by(scheme_code=scheme_code).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_code}' not found.")
    row.is_active = False
    db.commit()
    return APIResponse(success=True, message=f"Scheme '{scheme_code}' deactivated.", data={})


# ---------------------------------------------------------------------------
# Training Centres
# ---------------------------------------------------------------------------

@router.get("/training-centres", response_model=APIResponse)
def list_centres(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    active_only: bool = Query(True),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List training centres with optional state/district filter."""
    q = db.query(TrainingCentre)
    if active_only:
        q = q.filter(TrainingCentre.is_active == True)
    if state:
        q = q.filter(TrainingCentre.state.ilike(f"%{state}%"))
    if district:
        q = q.filter(TrainingCentre.district.ilike(f"%{district}%"))
    total = q.count()
    rows = q.offset(skip).limit(limit).all()
    return APIResponse(
        success=True,
        message=f"{len(rows)} training centres returned.",
        data={
            "total": total,
            "items": [
                {
                    "id": r.id, "centre_id": r.centre_id, "name": r.name,
                    "centre_type": r.centre_type, "district": r.district,
                    "state": r.state, "is_active": r.is_active,
                    "available_seats": r.available_seats,
                    "source_url": r.source_url,
                }
                for r in rows
            ],
        },
    )


@router.put("/training-centres/{centre_id}", response_model=APIResponse)
def update_centre(
    centre_id: str,
    body: CentreUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a training centre record."""
    row = db.query(TrainingCentre).filter_by(centre_id=centre_id).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Centre '{centre_id}' not found.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(row, field, value)
    db.commit()
    return APIResponse(success=True, message=f"Centre '{centre_id}' updated.", data={})


@router.delete("/training-centres/{centre_id}", response_model=APIResponse)
def deactivate_centre(
    centre_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Soft-delete a training centre."""
    row = db.query(TrainingCentre).filter_by(centre_id=centre_id).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Centre '{centre_id}' not found.")
    row.is_active = False
    db.commit()
    return APIResponse(success=True, message=f"Centre '{centre_id}' deactivated.", data={})