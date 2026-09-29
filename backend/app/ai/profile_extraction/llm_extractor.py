import os
import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.schemas.ai import ExtractedProfileData

logger = logging.getLogger(__name__)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

FALLBACK_PROMPT = """You are an expert multilingual AI extraction engine for India's National Skills Qualifications Framework (NSQF).
Analyze the candidate's spoken or written text (in English, Tamil, Hindi, or any Indian vernacular language).
Extract the following fields strictly into a JSON object:
{
  "education": "e.g. 10th Standard, 12th Standard, ITI, Diploma, Graduate Degree, 8th Standard, or unknown",
  "qualification": "e.g. Higher Secondary Certificate (HSC) or Secondary School Leaving Certificate (SSLC) or unknown",
  "prior_occupation": "e.g. Tailoring / Apparel Stitching, Domestic Electrician, Two-Wheeler Mechanic, or unknown",
  "experience_years": 0.0,
  "livelihood_goal": "e.g. self-employment, wage employment, or unknown",
  "work_preference": "e.g. flexible, home-based, local",
  "resources": ["list of physical tools or equipment owned like sewing machine, laptop, smartphone, etc."],
  "constraints": ["list of constraints like localized within 5km, daytime only, home-based, etc."]
}
Only extract facts clearly implied or stated. Return ONLY valid JSON.
"""

def extract_with_gemini(text: str, api_key: str) -> Optional[Dict[str, Any]]:
    """Calls Google Gemini API for structured extraction."""
    try:
        payload = {
            "contents": [{
                "parts": [
                    {"text": FALLBACK_PROMPT},
                    {"text": f"Candidate Input: \"{text}\""}
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(
                GEMINI_API_URL,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(candidate_text)
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Error during Gemini extraction: {e}")
    return None

def fallback_semantic_extractor(text: str) -> Dict[str, Any]:
    """
    Intelligent heuristic semantic inference engine for conversational vernacular speech.
    Extracts implicit cues when simple regex fails (e.g. Tanglish/Hinglish, narrative stories).
    """
    t = text.lower()
    inferred: Dict[str, Any] = {
        "education": "unknown",
        "qualification": "unknown",
        "prior_occupation": "unknown",
        "experience_years": 0.0,
        "livelihood_goal": "unknown",
        "work_preference": "flexible",
        "resources": [],
        "constraints": []
    }

    # Education heuristics
    if any(k in t for k in ["college", "degree", "bcom", "bsc", "btech", "be ", "பட்டதாரி"]):
        inferred["education"] = "Graduate Degree"
        inferred["qualification"] = "Bachelor's Degree"
    elif any(k in t for k in ["polytechnic", "diploma", "டிப்ளமோ"]):
        inferred["education"] = "Diploma"
        inferred["qualification"] = "Polytechnic / Technical Diploma"
    elif any(k in t for k in ["iti", "ஐடிஐ", "आईटीआई"]):
        inferred["education"] = "ITI"
        inferred["qualification"] = "Industrial Training Institute Certificate"
    elif any(k in t for k in ["plus two", "12th", "12 ", "twelfth", "ஹையர் செகண்டரி", "12ம்"]):
        inferred["education"] = "12th Standard"
        inferred["qualification"] = "Higher Secondary Certificate (HSC)"
    elif any(k in t for k in ["10th", "tenth", "sslc", "10 ", "பத்தாம்"]):
        inferred["education"] = "10th Standard"
        inferred["qualification"] = "Secondary School Leaving Certificate (SSLC)"

    # Prior occupation heuristics
    if any(k in t for k in ["stitching", "cloth", "dress", "tailor", "sewing", "தையல்", "துணி", "சட்டை", "சுடிதார்", "ब्लाउज़", "सिलाई"]):
        inferred["prior_occupation"] = "Tailoring / Apparel Stitching"
    elif any(k in t for k in ["wiring", "switch", "electric", "power", "மின்", "ஒயரிங்", "बिजली", "वायरिंग"]):
        inferred["prior_occupation"] = "Domestic Electrician Assistant"
    elif any(k in t for k in ["solar", "panel", "சூரிய மின்சாரம்", "सोलर"]):
        inferred["prior_occupation"] = "Solar Panel Installation"
    elif any(k in t for k in ["bike", "motorcycle", "scooter", "இருசக்கர", "மெக்கானிக்", "बाइक"]):
        inferred["prior_occupation"] = "Two-Wheeler Mechanical Servicing"
    elif any(k in t for k in ["computer", "data entry", "office", "typing", "கணினி", "टाइपिंग"]):
        inferred["prior_occupation"] = "Data Operations & Office Assistant"

    # Livelihood goal
    if any(k in t for k in ["own shop", "business", "self employ", "entrepreneur", "சொந்த தொழில்", "கடை வைக்க", "खुद का काम", "दुकान"]):
        inferred["livelihood_goal"] = "self-employment"
    elif any(k in t for k in ["company", "salary", "job", "wage", "வேலை வேண்டும்", "மாத சம்பளம்", "नौकरी"]):
        inferred["livelihood_goal"] = "wage employment"

    # Work preference & constraints
    if any(k in t for k in ["home", "house", "வீட்டிலிருந்தே", "வீடு", "घर से"]):
        inferred["work_preference"] = "home-based"
        inferred["constraints"].append("home-based only due to caregiving")
    if any(k in t for k in ["near", "local", "5km", "பக்கத்தில்", "உள்ளூர்", "पास में"]):
        inferred["constraints"].append("cannot travel far / localized within 5km")

    # Resources
    if any(k in t for k in ["machine", "தையல் மெஷின்", "தையல் இயந்திரம்", "सिलाई मशीन"]):
        inferred["resources"].append("sewing machine")
    if any(k in t for k in ["phone", "smartphone", "மொபைல்", "ஸ்மார்ட்போன்", "फोन"]):
        inferred["resources"].append("smartphone with UPI")
    if any(k in t for k in ["tool", "meter", "கருவி", "औज़ार"]):
        inferred["resources"].append("electrical hand toolset")

    return inferred

def refine_with_llm(raw_text: str, current_extracted: ExtractedProfileData, unresolved: list) -> ExtractedProfileData:
    """
    Dual-engine orchestration:
    If critical fields are unknown or unresolved, queries LLM or enhanced fallback semantic engine
    to enrich candidate profile.
    """
    if not unresolved and current_extracted.prior_occupation != "unknown" and current_extracted.education != "unknown":
        return current_extracted

    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    llm_data = None
    if api_key:
        llm_data = extract_with_gemini(raw_text, api_key)
    
    if not llm_data:
        llm_data = fallback_semantic_extractor(raw_text)

    # Merge non-destructive enrichment
    if current_extracted.education == "unknown" and llm_data.get("education") != "unknown":
        current_extracted.education = llm_data.get("education", "unknown")
        current_extracted.qualification = llm_data.get("qualification", "unknown")

    if current_extracted.prior_occupation == "unknown" and llm_data.get("prior_occupation") != "unknown":
        current_extracted.prior_occupation = llm_data.get("prior_occupation", "unknown")

    if current_extracted.experience_years == 0.0 and float(llm_data.get("experience_years", 0.0)) > 0:
        current_extracted.experience_years = float(llm_data.get("experience_years", 0.0))

    if current_extracted.livelihood_goal == "unknown" and llm_data.get("livelihood_goal") != "unknown":
        current_extracted.livelihood_goal = llm_data.get("livelihood_goal", "unknown")

    if current_extracted.work_preference == "flexible" and llm_data.get("work_preference") != "flexible":
        current_extracted.work_preference = llm_data.get("work_preference", "flexible")

    for res in llm_data.get("resources", []):
        if res not in current_extracted.resources:
            current_extracted.resources.append(res)

    for con in llm_data.get("constraints", []):
        if con not in current_extracted.constraints:
            current_extracted.constraints.append(con)

    return current_extracted
