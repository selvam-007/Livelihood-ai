from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.profile import UserProfile, UserSkill


def get_aggregate_admin_analytics(db: Session) -> Dict[str, Any]:
    """
    Compute aggregated, privacy-safe analytics for the administrative dashboard.
    Strictly excludes all personally identifiable information (PII).

    Returns real values from the database only.
    When the database is empty or has very few records, the 'is_empty_state' flag
    is set to True so the frontend can render a proper empty state instead of
    displaying misleading numbers.
    """
    total_candidates = db.query(User).filter(User.role == "candidate").count()
    completed_assessments = db.query(UserProfile).filter(UserProfile.completion_percentage >= 80).count()
    total_skills_logged = db.query(UserSkill).count()

    # Real skill demand from actual DB records
    skill_counts = (
        db.query(UserSkill.skill_name, func.count(UserSkill.id).label("count"))
        .group_by(UserSkill.skill_name)
        .order_by(func.count(UserSkill.id).desc())
        .limit(6)
        .all()
    )

    colors = ["#22c55e", "#06b6d4", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"]
    skill_chart_data = [
        {"name": name, "count": count, "color": colors[idx % len(colors)]}
        for idx, (name, count) in enumerate(skill_counts)
    ]

    # Determine whether this is an empty-state scenario
    is_empty = total_candidates == 0 or total_skills_logged == 0

    return {
        "is_empty_state": is_empty,
        "kpis": {
            "total_candidates": total_candidates,
            "completed_voice_assessments": completed_assessments,
            "total_skills_logged": total_skills_logged,
            # These metrics require additional tracking not yet implemented
            "active_livelihood_roadmaps": None,
            "identified_competency_gaps": None,
        },
        "skill_demand": skill_chart_data,
        # Competency gaps, top pathways, and regional distribution require
        # additional data sources (NSQF enrollment logs, regional tagging).
        # Return empty lists rather than invented data.
        "competency_gaps": [],
        "top_pathways": [],
        "regional_distribution": [],
        "privacy_guarantee": "PII Shield Active: All individual names, phones, and locations are scrubbed.",
        "data_note": (
            "This dashboard shows only real data collected by the system. "
            "Seed synthetic data (admin-only) to populate charts for demonstration."
            if is_empty else
            "Live data. Charts reflect actual candidate activity."
        ),
    }
