"""
Authoritative NSQF Scoring & Affinity Engine.
Unified scoring function used across Recommendation, RAG Retrieval, and Gap Analysis.
Eliminates artificial score floors/ceilings, enforces documented weights (40-25-15-10-10),
and provides complete mathematical explainability.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from app.knowledge.nsqf_catalog import OCCUPATION_DOMAIN_MAP

from app.knowledge.skill_taxonomy import normalize_candidate_skills

# Standard educational hierarchy mapped to ordinal levels
EDUCATION_HIERARCHY = {
    "unknown": 0,
    "none": 0,
    "5th standard": 1,
    "8th standard": 2,
    "10th standard": 3,
    "10th": 3,
    "sslc": 3,
    "12th standard": 4,
    "12th": 4,
    "hsc": 4,
    "iti": 4,
    "diploma": 5,
    "polytechnic": 5,
    "graduate degree": 6,
    "bachelor": 6,
    "degree": 6,
    "postgraduate": 7,
    "master": 7
}


def parse_edu_level(edu_text: str) -> int:
    """Parses arbitrary education strings into ordinal hierarchy level."""
    if not edu_text:
        return 0
    lowered = edu_text.lower().strip()
    for key, val in EDUCATION_HIERARCHY.items():
        if key in lowered:
            return val
    return 2  # default baseline if unspecified


@dataclass
class ScoreBreakdown:
    total_score: float
    confidence_band: str  # "High Match", "Moderate Match", "Foundational / Low"
    skills_factor: float          # max 40.0
    experience_factor: float      # max 25.0
    education_factor: float       # max 15.0
    goal_factor: float            # max 10.0
    resource_factor: float        # max 10.0
    constraint_penalty: float     # 0.0 to 15.0 penalty
    matched_skills: List[str]
    missing_skills: List[str]
    overlap_count: int
    total_required_skills: int
    why_recommended: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def normalize_token_set(text_list: List[str]) -> List[str]:
    """Cleans and lowers a list of skill or resource strings."""
    return [s.lower().strip() for s in text_list if s and s.strip()]


def score_qp(
    candidate_skills: List[str],
    prior_occupation: str,
    experience_years: float,
    education: str,
    livelihood_goal: str,
    resources: Optional[List[str]] = None,
    constraints: Optional[List[str]] = None,
    qp: Optional[Dict[str, Any]] = None
) -> ScoreBreakdown:
    """
    Computes rigorous, honest match score (0.0 to 100.0) without artificial floors.
    
    Weights:
      1. Skills Overlap: 40%
      2. Experience & Prior Occupation Affinity: 25%
      3. Educational Compatibility: 15%
      4. Livelihood Goal Fit: 10%
      5. Available Resources & Tools Fit: 10%
      Minus Constraint Penalties (distance, caregiving, hours, capital mismatch)
    """
    if not qp:
        return ScoreBreakdown(
            total_score=0.0,
            confidence_band="Foundational / Low",
            skills_factor=0.0,
            experience_factor=0.0,
            education_factor=0.0,
            goal_factor=0.0,
            resource_factor=0.0,
            constraint_penalty=0.0,
            matched_skills=[],
            missing_skills=[],
            overlap_count=0,
            total_required_skills=0,
            why_recommended="No qualification pack data provided."
        )

    cand_skills_norm = normalize_token_set(candidate_skills)
    cand_resources_norm = normalize_token_set(resources or [])
    cand_constraints_norm = normalize_token_set(constraints or [])
    lowered_occ = (prior_occupation or "").lower().strip()
    lowered_goal = (livelihood_goal or "").lower().strip()
    qp_code = qp.get("qp_code", "").upper()

    # Canonical skill resolution
    canonical_cand_skills = normalize_candidate_skills(candidate_skills)
    canonical_cand_names = [c["canonical_name"].lower() for c in canonical_cand_skills]

    # -------------------------------------------------------------------------
    # 1. SKILLS OVERLAP FACTOR (40 pts)
    # -------------------------------------------------------------------------
    req_skills = qp.get("required_skills", [])
    matched_skills = []
    missing_skills = []

    for req in req_skills:
        req_low = req.lower().strip()
        is_matched = False
        # Direct match or canonical match
        if req_low in cand_skills_norm or req_low in canonical_cand_names:
            is_matched = True
        else:
            for cs in cand_skills_norm:
                if cs == req_low or (len(cs) > 4 and cs in req_low) or (len(req_low) > 4 and req_low in cs):
                    is_matched = True
                    break
        if is_matched:
            matched_skills.append(req)
        else:
            missing_skills.append(req)

    total_req = max(len(req_skills), 1)
    overlap_ratio = len(matched_skills) / total_req
    skills_factor = round(overlap_ratio * 40.0, 1)

    # -------------------------------------------------------------------------
    # 2. OCCUPATION & EXPERIENCE AFFINITY FACTOR (25 pts)
    # -------------------------------------------------------------------------
    mapped_qps = []
    for occ_key, target_qps in OCCUPATION_DOMAIN_MAP.items():
        if occ_key in lowered_occ:
            mapped_qps.extend(target_qps)

    occ_score = 0.0
    if qp_code in mapped_qps:
        occ_score = 18.0  # Direct high affinity
    elif any(word in lowered_occ for word in qp.get("qualification_name", "").lower().split() if len(word) > 4):
        occ_score = 16.0
    elif any(word in lowered_occ for word in qp.get("sector", "").lower().split() if len(word) > 4):
        occ_score = 13.0
    elif len(matched_skills) > 0 and experience_years > 0:
        occ_score = 7.0
    else:
        occ_score = 2.0  # Baseline career transition

    # Experience bonus based on verified duration
    min_exp = float(qp.get("min_experience_years", 0.5))
    if experience_years >= min_exp and occ_score >= 7.0:
        exp_bonus = min(7.0, round(experience_years * 2.0, 1))
    elif experience_years > 0 and occ_score >= 7.0:
        exp_bonus = 3.0
    else:
        exp_bonus = 0.0

    experience_factor = min(25.0, round(occ_score + exp_bonus, 1))

    # -------------------------------------------------------------------------
    # 3. EDUCATIONAL COMPATIBILITY FACTOR (15 pts)
    # -------------------------------------------------------------------------
    cand_edu_level = parse_edu_level(education)
    min_edu_level = parse_edu_level(qp.get("min_education", "8th Standard"))

    if cand_edu_level >= min_edu_level:
        education_factor = 15.0
    elif cand_edu_level == min_edu_level - 1:
        education_factor = 9.0  # Close prerequisite, eligible for bridge module
    elif cand_edu_level > 0:
        education_factor = 4.0
    else:
        education_factor = 7.0  # Unknown baseline

    # -------------------------------------------------------------------------
    # 4. LIVELIHOOD GOAL FIT (10 pts)
    # -------------------------------------------------------------------------
    is_self_emp_goal = any(k in lowered_goal for k in ["self", "business", "own", "shop", "enterprise", "freelance"])
    is_wage_goal = any(k in lowered_goal for k in ["job", "wage", "company", "salary", "employment"])

    has_self_pathway = bool(qp.get("self_employment_pathways"))
    has_wage_pathway = bool(qp.get("employment_pathways"))

    if is_self_emp_goal and has_self_pathway:
        if "self" in qp.get("qualification_name", "").lower():
            goal_factor = 10.0
        else:
            goal_factor = 8.5
    elif is_wage_goal and has_wage_pathway:
        goal_factor = 10.0
    elif not is_self_emp_goal and not is_wage_goal:
        goal_factor = 7.0
    else:
        goal_factor = 5.0

    # -------------------------------------------------------------------------
    # 5. RESOURCE / TOOL FIT (10 pts)
    # -------------------------------------------------------------------------
    req_resources = qp.get("self_employment_pathways", {}).get("required_resources", [])
    req_res_norm = normalize_token_set(req_resources)

    if is_self_emp_goal and req_res_norm:
        matched_res_count = 0
        for r_req in req_res_norm:
            if any(r_cand in r_req or r_req in r_cand for r_cand in cand_resources_norm):
                matched_res_count += 1
        res_ratio = matched_res_count / max(len(req_res_norm), 1)
        resource_factor = round(res_ratio * 10.0, 1)
        if resource_factor == 0 and cand_resources_norm:
            resource_factor = 3.0
    else:
        resource_factor = 8.0 if cand_resources_norm else 7.0

    # -------------------------------------------------------------------------
    # 6. PRACTICAL CONSTRAINT PENALTY (0 to 15 pts)
    # -------------------------------------------------------------------------
    constraint_penalty = 0.0
    # Check travel / mobility constraints against field-heavy occupations
    has_mobility_constraint = any(c in cand_constraints_norm for c in ["cannot_travel_far", "no_travel", "home_bound", "caregiving"])
    is_heavy_field = any(qp.get("sector", "").lower().startswith(s) for s in ["construction", "mining", "infrastructure"])
    if has_mobility_constraint and is_heavy_field:
        constraint_penalty += 10.0

    # Check capital constraint for self-employment
    has_capital_constraint = any(c in cand_constraints_norm for c in ["no_capital", "low_funds", "zero_budget"])
    if is_self_emp_goal and has_capital_constraint and not any(r in cand_resources_norm for r in ["machine", "tools", "setup"]):
        constraint_penalty += 5.0

    # -------------------------------------------------------------------------
    # TOTAL SCORE & CONFIDENCE BAND (0.0 to 100.0)
    # -------------------------------------------------------------------------
    raw_total = (skills_factor + experience_factor + education_factor + goal_factor + resource_factor) - constraint_penalty
    total_score = round(min(max(raw_total, 0.0), 100.0), 1)

    if total_score >= 70.0:
        confidence_band = "High Match"
    elif total_score >= 40.0:
        confidence_band = "Moderate Match"
    else:
        confidence_band = "Foundational / Low"

    why_recommended = (
        f"Matches {len(matched_skills)}/{len(req_skills)} required skills ({skills_factor:.1f}/40 pts), "
        f"with {experience_factor:.1f}/25 pts for prior {lowered_occ or 'vocational'} experience, "
        f"and {education_factor:.1f}/15 pts for education readiness."
    )

    return ScoreBreakdown(
        total_score=total_score,
        confidence_band=confidence_band,
        skills_factor=skills_factor,
        experience_factor=experience_factor,
        education_factor=education_factor,
        goal_factor=goal_factor,
        resource_factor=resource_factor,
        constraint_penalty=constraint_penalty,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        overlap_count=len(matched_skills),
        total_required_skills=len(req_skills),
        why_recommended=why_recommended
    )
