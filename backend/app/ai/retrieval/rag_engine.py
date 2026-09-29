from typing import List, Dict, Any, Optional
from app.knowledge.nsqf_catalog import get_all_nsqf_qualifications, get_nsqf_qualification_by_code
from app.ai.scoring import score_qp, parse_edu_level


def retrieve_relevant_nsqf_pathways(
    prior_occupation: str,
    education: str,
    livelihood_goal: str,
    candidate_skills: List[str],
    resources: Optional[List[str]] = None,
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    RAG Retrieval Layer:
    Retrieves verified Qualification Packs from the authoritative NSQF Knowledge Base.
    Uses the unified scoring engine to ensure 100% consistency across all application views.
    Ensures zero hallucination of levels, codes, councils, or schemes.
    """
    catalog = get_all_nsqf_qualifications()
    scored_results = []

    for qp in catalog:
        breakdown = score_qp(
            candidate_skills=candidate_skills,
            prior_occupation=prior_occupation or "",
            experience_years=1.0,  # baseline retrieval reference
            education=education or "unknown",
            livelihood_goal=livelihood_goal or "unknown",
            resources=resources or [],
            qp=qp
        )

        scored_results.append({
            "qp_data": qp,
            "match_score": breakdown.total_score,
            "confidence_band": breakdown.confidence_band,
            "skill_overlap_count": breakdown.overlap_count,
            "total_skills_required": breakdown.total_required_skills,
            "matched_skills": breakdown.matched_skills,
            "missing_skills": breakdown.missing_skills,
            "score_breakdown": breakdown.to_dict(),
            "is_verified_nsqf": True,
            "scoring_type": "unified_nsqf_scorer"
        })

    # Rank by match score descending
    scored_results.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_results[:top_k]
