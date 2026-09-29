from typing import List, Dict, Any, Optional
from app.knowledge.nsqf_catalog import get_all_nsqf_qualifications
from app.ai.scoring import score_qp
from app.ai.competency_matching.gap_analyzer import analyze_competency_gaps


def rank_livelihood_recommendations(
    education: str,
    prior_occupation: str,
    experience_years: float,
    livelihood_goal: str,
    candidate_skills: List[str],
    resources: Optional[List[str]] = None,
    constraints: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Authoritative NSQF Recommendation Engine:
    Ranks viable NSQF pathways using the unified scoring engine:
      - Existing Skills (40%)
      - Prior Occupation & Experience (25%)
      - Educational Prerequisite Compatibility (15%)
      - Livelihood Goal Alignment (10%)
      - Available Physical Resources / Tools (10%)
      - Practical Constraints Penalties (Travel/Mobility/Capital)
    Outputs transparent, mathematically explainable recommendations with full score breakdown.
    Zero score flooring; returns genuine 0.0 - 100.0 alignment scores.
    """
    catalog = get_all_nsqf_qualifications()
    scored_recommendations = []

    cand_skills_clean = [s for s in (candidate_skills or []) if s]
    cand_resources_clean = [r for r in (resources or []) if r]
    cand_constraints_clean = [c for c in (constraints or []) if c]

    candidate_profile_dict = {
        "education_level": education or "unknown",
        "prior_occupation": prior_occupation or "unknown",
        "experience_years": float(experience_years or 0.0),
        "livelihood_goal": livelihood_goal or "unknown",
        "resources": cand_resources_clean,
        "constraints": cand_constraints_clean
    }

    for qp in catalog:
        # Run unified scoring
        breakdown = score_qp(
            candidate_skills=cand_skills_clean,
            prior_occupation=prior_occupation or "",
            experience_years=float(experience_years or 0.0),
            education=education or "unknown",
            livelihood_goal=livelihood_goal or "unknown",
            resources=cand_resources_clean,
            constraints=cand_constraints_clean,
            qp=qp
        )

        # Detailed competency gap analysis for this QP
        gap_info = analyze_competency_gaps(cand_skills_clean, qp["qp_code"], candidate_profile_dict)

        # Construct concise, honest explainability narrative
        matched_cnt = breakdown.overlap_count
        exp_yr = float(experience_years or 0.0)
        occ_str = prior_occupation if prior_occupation and prior_occupation.lower() != "unknown" else "practical work"

        explanation_en = (
            f"Evaluated with an honest match score of {breakdown.total_score}% ({breakdown.confidence_band}). "
            f"Your background in {occ_str} ({exp_yr:.1f} yr) and {matched_cnt} verified skill(s) "
            f"align with {qp['qualification_name']}. "
            f"Bridge requirement: {gap_info.get('estimated_bridge_hours', 80)} hours via {gap_info.get('recommended_training_mode', qp['official_scheme'])}."
        )

        explanation_ta = (
            f"பொருத்தம்: {breakdown.total_score}% ({breakdown.confidence_band}). "
            f"உங்கள் {occ_str} அனுபவம் மற்றும் {matched_cnt} கண்டறியப்பட்ட திறன்கள் "
            f"{qp['qualification_name']} உடன் பொருந்துகின்றன. "
            f"தேவையான பயிற்சி: {gap_info.get('estimated_bridge_hours', 80)} மணிநேரம் ({qp['official_scheme']})."
        )

        scored_recommendations.append({
            "qp_code": qp["qp_code"],
            "qualification_name": qp["qualification_name"],
            "nsqf_level": qp["nsqf_level"],
            "sector": qp["sector"],
            "council": qp["council"],
            "match_score": breakdown.total_score,
            "confidence_band": breakdown.confidence_band,
            "scoring_type": "unified_nsqf_scorer",
            "score_breakdown": {
                "skills_score": breakdown.skills_factor,
                "experience_score": breakdown.experience_factor,
                "education_score": breakdown.education_factor,
                "goal_score": breakdown.goal_factor,
                "resource_score": breakdown.resource_factor,
                "constraint_penalty": breakdown.constraint_penalty,
                "max_possible": 100.0
            },
            "why_recommended": breakdown.why_recommended,
            "matched_skills_count": breakdown.overlap_count,
            "total_skills_required": breakdown.total_required_skills,
            "matched_skills": breakdown.matched_skills,
            "missing_skills": breakdown.missing_skills,
            "missing_competencies_count": gap_info["missing_count"],
            "estimated_bridge_hours": gap_info.get("estimated_bridge_hours", 60),
            "recommended_training_mode": gap_info.get("recommended_training_mode", "STT"),
            "official_scheme": qp["official_scheme"],
            "training_duration_hours": qp["training_duration_hours"],
            "employment_pathway": qp.get("employment_pathways", {}),
            "self_employment_pathway": qp.get("self_employment_pathways", {}),
            "explanation_en": explanation_en,
            "explanation_ta": explanation_ta,
            "primary_reason_pillars": [
                f"Skills: {breakdown.skills_factor:.1f}/40.0 pts ({breakdown.overlap_count}/{breakdown.total_required_skills} matched)",
                f"Domain & Experience: {breakdown.experience_factor:.1f}/25.0 pts",
                f"Prerequisite Education: {breakdown.education_factor:.1f}/15.0 pts",
                f"Goal & Tooling Fit: {(breakdown.goal_factor + breakdown.resource_factor):.1f}/20.0 pts"
            ]
        })

    # Sort descending by match score
    scored_recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_recommendations
