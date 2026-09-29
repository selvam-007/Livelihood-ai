from typing import Dict, Any, List
from app.knowledge.nsqf_catalog import get_nsqf_qualification_by_code
from app.ai.competency_matching.gap_analyzer import analyze_competency_gaps


def rank_competency_urgency(comp: Dict[str, Any]) -> int:
    """Calculates sorting weight based on official NSQF urgency and criticality."""
    urgency_weights = {"High": 30, "Medium": 20, "Low": 10}
    criticality_weights = {
        "Core Technical": 15,
        "Safety Standard": 15,
        "Testing & Diagnosis": 12,
        "Quality Assurance": 10,
        "Entrepreneurship": 10,
        "Digital Literacy": 8,
        "Pre-Installation": 8,
        "Data Operations": 8
    }
    urg = urgency_weights.get(comp.get("urgency", "Medium"), 15)
    crit = criticality_weights.get(comp.get("criticality", "Core Technical"), 10)
    return urg + crit


def generate_personalized_roadmap(
    candidate_profile: Dict[str, Any],
    qp_code: str
) -> Dict[str, Any]:
    """
    Personalized Livelihood Roadmap Engine:
    Dynamically sorts competency gaps by urgency and criticality.
    Calculates adjusted bridge training hours based on individual candidate baseline.
    Generates actionable 5-stage sequential progression to NSQF accreditation.
    """
    qp = get_nsqf_qualification_by_code(qp_code)
    if not qp:
        return {
            "error": f"Qualification Pack '{qp_code}' not found.",
            "target_qp_code": qp_code,
            "stages": []
        }

    skills = candidate_profile.get("skills", [])
    skill_names = [s.get("skill_name") if isinstance(s, dict) else s for s in skills]
    gap_analysis = analyze_competency_gaps(skill_names, qp_code, candidate_profile)

    # Separate and sort missing / partial competencies by urgency & criticality
    missing_comps = [c for c in gap_analysis.get("competency_gaps", []) if c["status"] in ("missing", "partial")]
    missing_comps.sort(key=rank_competency_urgency, reverse=True)

    top_missing_modules = missing_comps[:3]
    top_urgent_title = top_missing_modules[0]["title"] if top_missing_modules else "Core Professional Practice"
    top_urgent_nos = top_missing_modules[0]["nos_code"] if top_missing_modules else ""

    # Dynamically adjust training duration based on existing competencies
    base_hours = int(qp.get("training_duration_hours", 300))
    total_comps = max(gap_analysis.get("total_competencies", 1), 1)
    missing_cnt = gap_analysis.get("missing_count", 0) + (0.5 * gap_analysis.get("partial_count", 0))
    
    is_rpl = gap_analysis.get("recommended_training_mode", "").startswith("RPL")
    adjusted_duration_hours = gap_analysis.get("estimated_bridge_hours", max(30, int(base_hours * (missing_cnt / total_comps))))

    matched_names = [s["skill_name"] for s in gap_analysis.get("matched_skills", [])]
    baseline_skills_str = ", ".join(matched_names[:3]) if matched_names else "Foundational Domain Aptitude"

    bridge_modules_list = []
    for m in top_missing_modules:
        bridge_modules_list.append(f"{m.get('nos_code', 'NOS')}: {m.get('title', '')} [{m.get('criticality', 'Technical')}]")

    is_self_emp = "self" in str(candidate_profile.get("livelihood_goal", "")).lower()

    if is_rpl:
        # RPL Pathway (Recognition of Prior Learning - Fast Track)
        stages = [
            {
                "stage_number": 1,
                "stage_name": "Recognition of Prior Learning (RPL) Eligibility",
                "stage_name_ta": "முந்தைய அனுபவ அங்கீகாரம் (RPL)",
                "status": "completed",
                "description": f"Verified informal experience in {candidate_profile.get('prior_occupation', 'trade')} ({candidate_profile.get('experience_years', 1)} years) qualifies for fast-track RPL certification.",
                "key_attributes": [
                    f"Prior Experience: {candidate_profile.get('experience_years', 1)} years",
                    f"Recognized Skills: {baseline_skills_str}",
                    "Assessment Track: Fast-Track RPL (No full course required)"
                ]
            },
            {
                "stage_number": 2,
                "stage_name": "Mandatory RPL Orientation (12-16 Hours)",
                "stage_name_ta": "RPL வழிகாட்டுதல் பயிற்சி (12-16 மணிநேரம்)",
                "status": "active_next",
                "description": "Standardized orientation on modern industry safety, hygiene, digital UPI transactions, and NOS assessment format.",
                "key_attributes": [
                    "Scheme: PMKVY 4.0 RPL Component",
                    "Topics: Safety Standards, Digital Payments & Code of Conduct",
                    "Cost: 100% Free (Govt Sponsored)"
                ]
            },
            {
                "stage_number": 3,
                "stage_name": f"Targeted NOS Bridge Training ({adjusted_duration_hours} Hours)",
                "stage_name_ta": f"இடைவெளி திறன் பயிற்சி ({adjusted_duration_hours} மணிநேரம்)",
                "status": "upcoming",
                "description": f"Short intensive bridge training focusing exclusively on missing technical competencies.",
                "key_attributes": [
                    f"Urgent Gap: {top_urgent_title} ({top_urgent_nos})",
                    f"Bridge Modules: {'; '.join(bridge_modules_list) if bridge_modules_list else 'Core Practical Modules'}",
                    "Location: Authorized PMKK / District Skill Center"
                ]
            },
            {
                "stage_number": 4,
                "stage_name": "Sector Skill Council Assessment & ₹500 Reward",
                "stage_name_ta": "தேர்வு மற்றும் ₹500 நேரடி உதவித்தொகை",
                "status": "upcoming",
                "description": "Practical viva and demonstration by certified independent assessor. Receive NSQF certificate and DBT reward.",
                "key_attributes": [
                    f"Certifying Body: {qp.get('council', 'NCVET Authorized SSC')}",
                    "Incentive: ₹500 direct bank transfer on passing",
                    "Insurance: 3-Year Kaushal Bima accident cover (₹2 Lakh)"
                ]
            },
            {
                "stage_number": 5,
                "stage_name": "Livelihood Outcome: Enterprise Credit / Wage Jump",
                "stage_name_ta": "வாழ்வாதார மேம்பாடு (நிதி உதவி / சம்பள உயர்வு)",
                "status": "upcoming",
                "description": "Formal NSQF certificate opens access to government loan schemes and higher-wage formal employment.",
                "key_attributes": [
                    "Self-Employment: Mudra Shishu Loan (up to ₹50,000) or PM Vishwakarma credit (5% interest)",
                    "Wage Placement: Formal certification recognized by top industry employers",
                    f"Expected Income: {qp.get('self_employment_pathways', {}).get('potential_monthly_income', '₹20,000 - ₹35,000/mo') if is_self_emp else qp.get('employment_pathways', {}).get('potential_monthly_income', '₹16,000 - ₹25,000/mo')}"
                ]
            }
        ]
    else:
        # STT Pathway (Short-Term Training - Comprehensive)
        stages = [
            {
                "stage_number": 1,
                "stage_name": "Candidate Profile & Prerequisite Verification",
                "stage_name_ta": "சுயவிவர சரிபார்ப்பு மற்றும் சேர்க்கை தகுதி",
                "status": "completed",
                "description": f"Educational baseline ({candidate_profile.get('education_level', 'Secondary')}) verified against {qp['qp_code']} entry requirements.",
                "key_attributes": [
                    f"Prerequisite Met: Min {qp.get('min_education', '8th Standard')}",
                    f"Target NSQF: {qp.get('nsqf_level', 'Level 4')}",
                    "Course Fee: ₹0 (Fully funded by Central Government)"
                ]
            },
            {
                "stage_number": 2,
                "stage_name": "Free Enrolment at PMKK / ITI Center",
                "stage_name_ta": "அரசு அங்கீகாரம் பெற்ற மையத்தில் சேர்க்கை",
                "status": "active_next",
                "description": f"Enrol into upcoming cohort under {qp.get('official_scheme', 'PMKVY 4.0')} with biometric attendance.",
                "key_attributes": [
                    "Scheme: PMKVY 4.0 Short Term Training (STT)",
                    "Provided: Free uniform, bag, course books & NSQF curriculum",
                    "Batch: Regular weekday / weekend flexi-batches"
                ]
            },
            {
                "stage_number": 3,
                "stage_name": f"Core Competency Lab Training ({adjusted_duration_hours} Hours)",
                "stage_name_ta": f"முழுமையான செய்முறை பயிற்சி ({adjusted_duration_hours} மணிநேரம்)",
                "status": "upcoming",
                "description": f"Comprehensive hands-on workshop training covering theory, labs, and modern equipment.",
                "key_attributes": [
                    f"Core Technical Focus: {top_urgent_title}",
                    f"Key Modules: {'; '.join(bridge_modules_list) if bridge_modules_list else 'Full QP Curriculum'}",
                    "Pedagogy: 70% Practical Hands-on, 30% Theory"
                ]
            },
            {
                "stage_number": 4,
                "stage_name": "NCVET Digital Certificate & Apprenticeship (NAPS)",
                "stage_name_ta": "டிஜிட்டல் சான்றிதழ் மற்றும் தொழில் பழகுநர் பயிற்சி",
                "status": "upcoming",
                "description": "SSC practical exam and digital credential issued directly on Skill India Digital portal and DigiLocker.",
                "key_attributes": [
                    "Certificate: Digitally signed QR-coded NSQF credential",
                    "NAPS Apprenticeship: Optional 6-12 month paid apprenticeship",
                    "Stipend Subsidy: Govt provides up to ₹1,500/month stipend co-funding"
                ]
            },
            {
                "stage_number": 5,
                "stage_name": "Placement & Enterprise Setup Support",
                "stage_name_ta": "வேலைவாய்ப்பு மற்றும் தொழில் தொடங்குதல்",
                "status": "upcoming",
                "description": f"Direct placement assistance with partner employers or Mudra enterprise funding guidance.",
                "key_attributes": [
                    f"Target Roles: {', '.join(qp.get('employment_pathways', {}).get('job_roles', ['Associate']))}",
                    f"Estimated Income: {qp.get('employment_pathways', {}).get('potential_monthly_income', '₹15,000 - ₹25,000/mo')}",
                    "Placement Support: Rozgar Melas and direct employer interviews"
                ]
            }
        ]

    immediate_action = (
        f"Enroll in {qp.get('official_scheme', 'PMKVY 4.0')} {'RPL fast-track' if is_rpl else 'short-term training'} cohort ({adjusted_duration_hours} hours). "
        f"Focus on mastering '{top_urgent_title}' ({top_urgent_nos}) as your primary technical priority."
    )

    immediate_action_ta = (
        f"உங்கள் அருகிலுள்ள மையத்தில் {qp.get('official_scheme', 'PMKVY 4.0')} பயிற்சியில் ({adjusted_duration_hours} மணிநேரம்) இணையவும். "
        f"முதலில் '{top_urgent_title}' பயிற்சியை நிறைவு செய்யவும்."
    )

    return {
        "target_qp_code": qp["qp_code"],
        "target_qualification_name": qp["qualification_name"],
        "nsqf_level": qp["nsqf_level"],
        "sector": qp["sector"],
        "council": qp["council"],
        "training_mode": "RPL" if is_rpl else "STT",
        "stages": stages,
        "immediate_action": immediate_action,
        "immediate_action_ta": immediate_action_ta,
        "adjusted_duration_hours": adjusted_duration_hours,
        "top_urgent_gap": {
            "title": top_urgent_title,
            "nos_code": top_urgent_nos
        },
        "employment_outcome": qp.get("employment_pathways", {}),
        "self_employment_outcome": qp.get("self_employment_pathways", {}),
        "gap_analysis_summary": gap_analysis
    }
