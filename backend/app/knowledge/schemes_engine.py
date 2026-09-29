"""
Government Scheme Eligibility & Benefit Engine for LivelihoodAI.
Assesses candidate profile against major Indian skilling & micro-livelihood schemes:
  1. PMKVY 4.0 Short Term Training (STT)
  2. PMKVY 4.0 Recognition of Prior Learning (RPL)
  3. PM Vishwakarma Scheme (Artisan toolkit & subsidized credit)
  4. NAPS (National Apprenticeship Promotion Scheme)
  5. DDU-GKY (Deen Dayal Upadhyaya Grameen Kaushalya Yojana)
  6. Samarth Scheme (Textiles and Apparel)
  7. Pradhan Mantri MUDRA Yojana (PMMY - Shishu / Kishore / Tarun)
"""

from typing import Dict, List, Any, Optional

SCHEME_REGISTRY = {
    "PMKVY_STT": {
        "scheme_code": "PMKVY_STT",
        "name": "PMKVY 4.0 Short Term Training (STT)",
        "ministry": "Ministry of Skill Development and Entrepreneurship (MSDE)",
        "primary_benefit": "100% Free NSQF accredited training, assessment, and government certificate",
        "stipend_reward": "Accident insurance for 3 years + assessment fee covered",
        "eligibility_summary": "Any Indian national aged 15-45 seeking wage employment or skilling in high-demand trades.",
        "application_url": "https://www.skillindiadigital.gov.in"
    },
    "PMKVY_RPL": {
        "scheme_code": "PMKVY_RPL",
        "name": "PMKVY 4.0 Recognition of Prior Learning (RPL)",
        "ministry": "Ministry of Skill Development and Entrepreneurship (MSDE)",
        "primary_benefit": "Formal certification of existing unorganized skills + 12-80 hour bridge training",
        "stipend_reward": "₹500 direct DBT reward upon certification + Kaushal Bima (3-yr accident cover)",
        "eligibility_summary": "Informal workers with 1+ years of prior practical experience in relevant trade.",
        "application_url": "https://www.skillindiadigital.gov.in"
    },
    "PM_VISHWAKARMA": {
        "scheme_code": "PM_VISHWAKARMA",
        "name": "PM Vishwakarma Scheme",
        "ministry": "Ministry of Micro, Small & Medium Enterprises (MSME)",
        "primary_benefit": "Skill verification, ₹15,000 e-voucher for modern toolkits, and collateral-free enterprise credit",
        "stipend_reward": "₹500/day training stipend during 5-7 days basic training + ₹15,000 toolkit grant + loan up to ₹3,00,000 at 5% interest",
        "eligibility_summary": "Traditional artisans and craftspeople working with hands and tools in 18 designated trades (tailor, carpenter, mason, cobbler, blacksmith, barber, etc.).",
        "application_url": "https://pmvishwakarma.gov.in"
    },
    "NAPS": {
        "scheme_code": "NAPS",
        "name": "National Apprenticeship Promotion Scheme (NAPS)",
        "ministry": "Ministry of Skill Development and Entrepreneurship (MSDE)",
        "primary_benefit": "On-the-job industrial apprenticeship with monthly stipend co-funded by government",
        "stipend_reward": "Government shares 25% of stipend (up to ₹1,500/month) directly via DBT",
        "eligibility_summary": "Candidates aged 14+ with basic minimum educational qualification (5th/8th/10th).",
        "application_url": "https://www.apprenticeshipindia.gov.in"
    },
    "DDU_GKY": {
        "scheme_code": "DDU_GKY",
        "name": "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
        "ministry": "Ministry of Rural Development (MoRD)",
        "primary_benefit": "Residential skilling with guaranteed 70% placement support for rural youth",
        "stipend_reward": "Free boarding, lodging, uniforms, books, and post-placement retention support (₹1,000-₹3,000/mo)",
        "eligibility_summary": "Rural youth aged 15-35 belonging to poor families (SECC 2011 / BPL).",
        "application_url": "http://ddugky.gov.in"
    },
    "SAMARTH": {
        "scheme_code": "SAMARTH",
        "name": "Samarth Scheme for Capacity Building in Textile Sector",
        "ministry": "Ministry of Textiles",
        "primary_benefit": "Wage-oriented placement training in garmenting, weaving, knitting, and apparel",
        "stipend_reward": "Aadhaar-enabled biometric attendance + guaranteed wage placement in textile clusters",
        "eligibility_summary": "Candidates with preference for women, SC/ST, and marginalized groups in textile hubs.",
        "application_url": "https://samarth-textiles.gov.in"
    },
    "MUDRA_LOAN": {
        "scheme_code": "MUDRA_LOAN",
        "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
        "ministry": "Ministry of Finance / SIDBI",
        "primary_benefit": "Collateral-free micro-enterprise financing across 3 tiers (Shishu, Kishore, Tarun)",
        "stipend_reward": "Shishu: up to ₹50,000 | Kishore: ₹50,000 to ₹5,00,000 | Tarun: ₹5,00,000 to ₹10,00,000",
        "eligibility_summary": "Micro-entrepreneurs, self-employed artisans, and small business owners with viable business plan.",
        "application_url": "https://www.mudra.org.in"
    }
}

# Designated 18 trades under PM Vishwakarma
VISHWAKARMA_TRADES = [
    "tailor", "tailoring", "carpenter", "woodware", "mason", "masonry",
    "barber", "hair stylist", "cobbler", "footwear", "blacksmith", "sculptor",
    "potter", "basket maker", "broom maker", "doll & toy maker", "goldsmith",
    "locksmith", "boat maker", "armourer", "fishing net maker"
]


def evaluate_scheme_eligibility(
    profile: Dict[str, Any],
    target_qp_code: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Evaluates a candidate's profile against government skilling & livelihood schemes.
    Returns ranked list of eligible schemes with specific benefit explanations and application steps.
    """
    results = []
    
    prior_occ = (profile.get("prior_occupation") or "").lower()
    exp_years = float(profile.get("experience_years") or 0.0)
    goal = (profile.get("livelihood_goal") or "").lower()
    qp_code = (target_qp_code or "").upper()
    is_self_emp = any(k in goal for k in ["self", "business", "own", "shop", "enterprise", "freelance"])
    is_apparel = any(k in prior_occ for k in ["tailor", "stitch", "sewing", "embroidery", "garment"]) or qp_code.startswith("AMH")

    # 1. PMKVY 4.0 Short Term Training (STT) - Always eligible for skilling
    stt_item = dict(SCHEME_REGISTRY["PMKVY_STT"])
    stt_item["is_eligible"] = True
    stt_item["match_confidence"] = "High"
    stt_item["customized_rationale"] = (
        "Eligible for 100% government-sponsored training at any authorized PMKK center. "
        "Complete NSQF certificate and assessment fees are fully subsidized."
    )
    results.append(stt_item)

    # 2. PMKVY 4.0 RPL (Recognition of Prior Learning)
    if exp_years >= 1.0 or "rpl" in prior_occ:
        rpl_item = dict(SCHEME_REGISTRY["PMKVY_RPL"])
        rpl_item["is_eligible"] = True
        rpl_item["match_confidence"] = "Very High"
        rpl_item["customized_rationale"] = (
            f"You have {exp_years:.1f} years of informal work experience. You can get fast-track "
            "government certification (12-80 hour bridge module) + ₹500 DBT reward without attending full course."
        )
        results.append(rpl_item)

    # 3. PM Vishwakarma Scheme
    is_vishwakarma_trade = any(trade in prior_occ for trade in VISHWAKARMA_TRADES) or qp_code in [
        "AMH/Q1947", "CON/Q0102", "BWS/Q0202", "HCS/Q6702", "PSC/Q0104"
    ]
    if is_vishwakarma_trade or is_self_emp:
        vishwa_item = dict(SCHEME_REGISTRY["PM_VISHWAKARMA"])
        vishwa_item["is_eligible"] = True
        vishwa_item["match_confidence"] = "Very High"
        vishwa_item["customized_rationale"] = (
            "Your trade qualifies under the 18 recognized PM Vishwakarma artisan categories. "
            "Eligible for ₹15,000 digital toolkit voucher, ₹500/day stipend during skill verification, "
            "and 5% subsidized collateral-free enterprise loan up to ₹3,00,000."
        )
        results.append(vishwa_item)

    # 4. Samarth Scheme (Textiles & Apparel)
    if is_apparel:
        samarth_item = dict(SCHEME_REGISTRY["SAMARTH"])
        samarth_item["is_eligible"] = True
        samarth_item["match_confidence"] = "High"
        samarth_item["customized_rationale"] = (
            "Eligible under Ministry of Textiles Samarth scheme for subsidized training and direct "
            "placement linkages with textile and garment export clusters."
        )
        results.append(samarth_item)

    # 5. MUDRA Loan (Self-Employment)
    if is_self_emp or exp_years >= 0.5:
        mudra_item = dict(SCHEME_REGISTRY["MUDRA_LOAN"])
        mudra_item["is_eligible"] = True
        mudra_item["match_confidence"] = "High"
        mudra_item["customized_rationale"] = (
            "Eligible for PMMY Shishu loan (up to ₹50,000) or Kishore loan (up to ₹5,00,000) "
            "at nominal interest rates from public sector banks with NSQF skill certificate as proof of competence."
        )
        results.append(mudra_item)

    # 6. NAPS (Apprenticeship)
    if not is_self_emp:
        naps_item = dict(SCHEME_REGISTRY["NAPS"])
        naps_item["is_eligible"] = True
        naps_item["match_confidence"] = "Moderate"
        naps_item["customized_rationale"] = (
            "Eligible for formal industrial apprenticeship contracts where the central government "
            "directly contributes up to ₹1,500/month towards your apprentice stipend."
        )
        results.append(naps_item)

    return results
