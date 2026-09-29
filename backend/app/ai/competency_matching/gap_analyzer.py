from typing import List, Dict, Any
from app.knowledge.nsqf_catalog import get_nsqf_qualification_by_code
from app.ai.scoring import score_qp


def analyze_competency_gaps(
    candidate_skills: List[str],
    qp_code: str,
    candidate_profile: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Competency Gap Analysis Engine:
    Compares candidate's skills against target NSQF Qualification Pack competencies (NOS).
    Evaluates each competency module individually based on related skills and NOS requirements.
    Zero artificial floors; returns honest 0.0 - 100.0 match score.
    """
    qp = get_nsqf_qualification_by_code(qp_code)
    if not qp:
        return {
            "error": f"Qualification Pack '{qp_code}' not found in verified registry.",
            "target_qp_code": qp_code,
            "match_score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "competency_gaps": [],
            "total_competencies": 0,
            "missing_count": 0,
            "readiness_summary": "Qualification pack code not found."
        }

    cand_skills_normalized = [s.lower().strip() for s in (candidate_skills or [])]

    # Evaluate required skills
    matched_skills: List[Dict[str, str]] = []
    missing_skills: List[Dict[str, str]] = []

    for req_skill in qp.get("required_skills", []):
        req_low = req_skill.lower().strip()
        has_skill = any(
            req_low == cs or (len(cs) > 4 and cs in req_low) or (len(req_low) > 4 and req_low in cs)
            for cs in cand_skills_normalized
        )
        if has_skill:
            matched_skills.append({
                "skill_name": req_skill,
                "status": "matched",
                "label": "✓ Existing Verified Skill"
            })
        else:
            missing_skills.append({
                "skill_name": req_skill,
                "status": "missing",
                "label": "✗ Competency Gap"
            })

    # Analyze NOS competency modules independently
    competency_gaps: List[Dict[str, Any]] = []
    competencies = qp.get("competencies", [])
    total_competencies = len(competencies)
    matched_comp_units = 0.0

    matched_skill_names_lower = [m["skill_name"].lower() for m in matched_skills]

    for comp in competencies:
        nos_code = comp.get("nos_code", "")
        title = comp.get("title", "")
        related_skills = [rs.lower() for rs in comp.get("related_skills", [])]
        
        # Check how many related skills are possessed
        matched_related = [rs for rs in related_skills if any(rs in ms or ms in rs for ms in matched_skill_names_lower)]
        
        # Also check title keywords
        title_keywords = [w for w in title.lower().split() if len(w) > 4 and w not in ["perform", "carry", "ensure", "maintain", "according"]]
        title_match = any(any(w in cs for w in title_keywords) for cs in cand_skills_normalized)

        if related_skills and len(matched_related) == len(related_skills):
            status = "matched"
            status_label = "Verified / Matched"
            matched_comp_units += 1.0
        elif matched_related or (title_match and len(matched_skills) > 0):
            status = "partial"
            status_label = "Partial Fit"
            matched_comp_units += 0.5
        else:
            status = "missing"
            status_label = "Needs Bridge Training"

        competency_gaps.append({
            "nos_code": nos_code,
            "title": title,
            "urgency": comp.get("urgency", "Medium"),
            "criticality": comp.get("criticality", "Core Technical"),
            "status": status,
            "status_label": status_label,
            "related_skills": comp.get("related_skills", [])
        })

    # Transparent competency fit score (0.0 to 100.0) without artificial floor
    if total_competencies > 0:
        competency_fit_score = round((matched_comp_units / total_competencies) * 100.0, 1)
    else:
        competency_fit_score = 0.0

    missing_count = len([c for c in competency_gaps if c["status"] == "missing"])
    partial_count = len([c for c in competency_gaps if c["status"] == "partial"])

    # Calculate estimated bridge training hours & training mode
    base_hours = int(qp.get("training_duration_hours", 300))
    exp_years = float(candidate_profile.get("experience_years", 0.0)) if candidate_profile else 0.0
    min_exp = float(qp.get("min_experience_years", 0.5))

    is_rpl_candidate = exp_years >= min_exp and competency_fit_score >= 35.0

    if is_rpl_candidate:
        recommended_training_mode = "RPL Bridge Training (Fast-Track Certification)"
        # RPL bridge is typically 12 to 80 hours
        missing_ratio = (missing_count + 0.5 * partial_count) / max(total_competencies, 1)
        estimated_bridge_hours = max(16, min(80, int(base_hours * missing_ratio * 0.35)))
    else:
        recommended_training_mode = "Full Short-Term Training (STT)"
        missing_ratio = (missing_count + 0.5 * partial_count) / max(total_competencies, 1)
        estimated_bridge_hours = max(80, int(base_hours * max(missing_ratio, 0.5)))

    # Sort competency gaps by urgency & criticality
    urgency_rank = {"High": 1, "Medium": 2, "Low": 3}
    criticality_rank = {"Core Technical": 1, "Testing & Diagnosis": 2, "Quality Assurance": 3, "Safety Standard": 4, "Entrepreneurship": 5, "Digital Literacy": 6}
    competency_gaps.sort(key=lambda c: (
        0 if c["status"] == "missing" else (1 if c["status"] == "partial" else 2),
        urgency_rank.get(c.get("urgency", "Medium"), 2),
        criticality_rank.get(c.get("criticality", "Core Technical"), 3)
    ))

    if competency_fit_score >= 70.0:
        readiness_summary = "High competency match. Eligible for direct Recognition of Prior Learning (RPL) assessment with fast-track certification."
    elif competency_fit_score >= 35.0:
        readiness_summary = f"Solid foundation present. Short-term {estimated_bridge_hours}-hour bridge training will close remaining gaps."
    else:
        readiness_summary = f"Foundational candidate. Comprehensive {estimated_bridge_hours}-hour modular training recommended before certification."

    return {
        "target_qp_code": qp["qp_code"],
        "target_qualification_name": qp["qualification_name"],
        "nsqf_level": qp["nsqf_level"],
        "sector": qp["sector"],
        "council": qp["council"],
        "official_scheme": qp["official_scheme"],
        "match_score": competency_fit_score,
        "scoring_type": "nos_competency_eval",
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "competency_gaps": competency_gaps,
        "total_competencies": total_competencies,
        "matched_count": len([c for c in competency_gaps if c["status"] == "matched"]),
        "partial_count": partial_count,
        "missing_count": missing_count,
        "estimated_bridge_hours": estimated_bridge_hours,
        "recommended_training_mode": recommended_training_mode,
        "readiness_summary": readiness_summary
    }
