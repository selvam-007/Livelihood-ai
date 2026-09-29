#!/usr/bin/env python3
"""
scripts/import_catalog.py
--------------------------
Idempotent import script — loads NSQF knowledge data from the static Python
knowledge files into the database tables created by Alembic.

Run after `alembic upgrade head`:
    python scripts/import_catalog.py [--dry-run]

Safe to run multiple times: uses INSERT-OR-REPLACE (SQLite) /
INSERT ... ON CONFLICT DO UPDATE (PostgreSQL) semantics via merge logic.

Data sources (read-only — these files are not modified):
  app/knowledge/nsqf_catalog.py    -> qualification_packs + nos_modules
  app/knowledge/schemes_engine.py  -> government_schemes
  app/knowledge/training_centres.py-> training_centres

Provenance fields:
  source_url       = "https://www.skillindiadigital.gov.in" (all rows)
  last_verified_at = None  (unknown — not fabricated)
  is_active        = True
"""

import sys
import os
import argparse
import logging
from datetime import datetime, timezone

# Allow running from repo root: python scripts/import_catalog.py
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database.session import engine, SessionLocal
from app.models.catalog import QualificationPack, NOSModule, GovernmentScheme, TrainingCentre

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("import_catalog")

SOURCE_URL = "https://www.skillindiadigital.gov.in"


def _upsert_qps(db: Session, dry_run: bool) -> int:
    """Load QualificationPacks + their NOSModules from nsqf_catalog.py."""
    from app.knowledge.nsqf_catalog import NSQF_QUALIFICATION_PACKS

    inserted = updated = 0
    for raw in NSQF_QUALIFICATION_PACKS:
        qp_code = raw["qp_code"]
        existing = db.query(QualificationPack).filter_by(qp_code=qp_code).first()

        row_data = dict(
            qp_code=qp_code,
            qualification_name=raw.get("qualification_name", ""),
            nsqf_level=raw.get("nsqf_level", ""),
            sector=raw.get("sector", ""),
            council=raw.get("council"),
            min_education=raw.get("min_education"),
            preferred_education=raw.get("preferred_education"),
            min_experience_years=float(raw.get("min_experience_years", 0.0)),
            training_duration_hours=raw.get("training_duration_hours"),
            official_scheme=raw.get("official_scheme"),
            description=raw.get("description"),
            required_skills=raw.get("required_skills", []),
            competencies=[],  # stored in nos_modules table
            employment_pathways=raw.get("employment_pathways", {}),
            self_employment_pathways=raw.get("self_employment_pathways", {}),
            regional_demand=raw.get("regional_demand", {}),
            suitable_for=raw.get("suitable_for", []),
            keywords=raw.get("keywords", []),
            source_url=SOURCE_URL,
            last_verified_at=None,
            is_active=True,
        )

        if existing:
            for k, v in row_data.items():
                setattr(existing, k, v)
            qp_obj = existing
            updated += 1
        else:
            qp_obj = QualificationPack(**row_data)
            db.add(qp_obj)
            inserted += 1

        if not dry_run:
            db.flush()  # get qp_obj.id for NOS FK

        # Upsert NOS modules
        for comp in raw.get("competencies", []):
            nos_code = comp.get("nos_code", "")
            if not nos_code:
                continue
            if not dry_run:
                nos_existing = db.query(NOSModule).filter_by(
                    qp_id=qp_obj.id, nos_code=nos_code
                ).first()
                nos_data = dict(
                    qp_id=qp_obj.id,
                    nos_code=nos_code,
                    title=comp.get("title", ""),
                    urgency=comp.get("urgency"),
                    criticality=comp.get("criticality"),
                    related_skills=comp.get("related_skills", []),
                    is_active=True,
                    source_url=SOURCE_URL,
                    last_verified_at=None,
                )
                if nos_existing:
                    for k, v in nos_data.items():
                        setattr(nos_existing, k, v)
                else:
                    db.add(NOSModule(**nos_data))

    log.info(f"QualificationPacks: {inserted} inserted, {updated} updated")
    return inserted + updated


def _upsert_schemes(db: Session, dry_run: bool) -> int:
    """Load GovernmentSchemes from schemes_engine.py."""
    from app.knowledge.schemes_engine import SCHEME_REGISTRY

    inserted = updated = 0
    # Structured eligibility rules derived from the engine''s evaluate logic
    # (Rules are expressed as structured fields rather than ad-hoc Python)
    ELIGIBILITY_RULES = {
        "PMKVY_STT": dict(min_age=15, max_age=45, min_education_code=None,
                          max_income_annual=None, requires_rural=None,
                          applicable_categories=[], applicable_states=[],
                          eligible_livelihood_goals=["Wage Employment", "Self-Employment"]),
        "PMKVY_RPL": dict(min_age=18, max_age=60, min_education_code=None,
                          max_income_annual=None, requires_rural=None,
                          applicable_categories=[], applicable_states=[],
                          eligible_livelihood_goals=["Wage Employment", "Self-Employment"]),
        "PM_VISHWAKARMA": dict(min_age=18, max_age=None, min_education_code=None,
                               max_income_annual=None, requires_rural=None,
                               applicable_categories=[], applicable_states=[],
                               eligible_livelihood_goals=["Self-Employment", "Artisan"]),
        "NAPS": dict(min_age=14, max_age=None, min_education_code="5th",
                     max_income_annual=None, requires_rural=None,
                     applicable_categories=[], applicable_states=[],
                     eligible_livelihood_goals=["Wage Employment", "Apprenticeship"]),
        "DDU_GKY": dict(min_age=15, max_age=35, min_education_code=None,
                        max_income_annual=None, requires_rural=True,
                        applicable_categories=[], applicable_states=[],
                        eligible_livelihood_goals=["Wage Employment"]),
        "SAMARTH": dict(min_age=14, max_age=None, min_education_code=None,
                        max_income_annual=None, requires_rural=None,
                        applicable_categories=["SC", "ST", "Women"],
                        applicable_states=[],
                        eligible_livelihood_goals=["Wage Employment"]),
        "MUDRA_LOAN": dict(min_age=18, max_age=None, min_education_code=None,
                           max_income_annual=None, requires_rural=None,
                           applicable_categories=[], applicable_states=[],
                           eligible_livelihood_goals=["Self-Employment", "Micro-Enterprise"]),
    }

    for scheme_code, raw in SCHEME_REGISTRY.items():
        existing = db.query(GovernmentScheme).filter_by(scheme_code=scheme_code).first()
        rules = ELIGIBILITY_RULES.get(scheme_code, {})
        row_data = dict(
            scheme_code=scheme_code,
            name=raw.get("name", ""),
            ministry=raw.get("ministry"),
            primary_benefit=raw.get("primary_benefit"),
            stipend_reward=raw.get("stipend_reward"),
            eligibility_summary=raw.get("eligibility_summary"),
            application_url=raw.get("application_url"),
            source_url=SOURCE_URL,
            last_verified_at=None,
            is_active=True,
            **rules,
        )
        if existing:
            for k, v in row_data.items():
                setattr(existing, k, v)
            updated += 1
        else:
            db.add(GovernmentScheme(**row_data))
            inserted += 1

    log.info(f"GovernmentSchemes: {inserted} inserted, {updated} updated")
    return inserted + updated


def _upsert_centres(db: Session, dry_run: bool) -> int:
    """Load TrainingCentres from training_centres.py."""
    from app.knowledge.training_centres import VERIFIED_TRAINING_CENTRES

    inserted = updated = 0
    for raw in VERIFIED_TRAINING_CENTRES:
        centre_id = raw["centre_id"]
        existing = db.query(TrainingCentre).filter_by(centre_id=centre_id).first()
        row_data = dict(
            centre_id=centre_id,
            name=raw.get("name", ""),
            centre_type=raw.get("type"),
            address=raw.get("address"),
            district=raw.get("district", ""),
            state=raw.get("state", ""),
            pincode=raw.get("pincode"),
            latitude=raw.get("latitude"),
            longitude=raw.get("longitude"),
            contact_person=raw.get("contact_person"),
            phone=raw.get("phone"),         # None = intentionally absent (Rule 5)
            email=raw.get("email"),
            official_portal=raw.get("official_portal"),
            affiliated_qp_codes=raw.get("affiliated_qps", []),
            official_schemes=raw.get("official_schemes", []),
            available_seats=raw.get("available_seats"),
            next_batch_date=raw.get("next_batch_date"),
            facilities=raw.get("facilities", []),
            source_url=SOURCE_URL,
            last_verified_at=None,
            is_active=True,
        )
        if existing:
            for k, v in row_data.items():
                setattr(existing, k, v)
            updated += 1
        else:
            db.add(TrainingCentre(**row_data))
            inserted += 1

    log.info(f"TrainingCentres: {inserted} inserted, {updated} updated")
    return inserted + updated


def main():
    parser = argparse.ArgumentParser(description="Import NSQF catalog data into the database.")
    parser.add_argument("--dry-run", action="store_true", help="Parse data without writing to DB")
    args = parser.parse_args()

    if args.dry_run:
        log.info("DRY RUN — no changes will be written to the database.")

    db: Session = SessionLocal()
    try:
        total = 0
        total += _upsert_qps(db, args.dry_run)
        total += _upsert_schemes(db, args.dry_run)
        total += _upsert_centres(db, args.dry_run)

        if args.dry_run:
            db.rollback()
            log.info(f"Dry run complete. Would have written {total} rows.")
        else:
            db.commit()
            log.info(f"Import complete. {total} rows written to database.")
    except Exception as exc:
        db.rollback()
        log.exception(f"Import failed: {exc}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()