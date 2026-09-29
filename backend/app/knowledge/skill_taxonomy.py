"""
Canonical Skill Taxonomy for LivelihoodAI.
Maps candidate vocational skills to canonical skill IDs, official NOS codes, sectors,
and multilingual aliases (English, Tamil, Hindi, Telugu, Kannada, Marathi, Bengali).
Eliminates free-text discrepancies and provides normalized competency mapping.
"""

from typing import Dict, List, Any, Optional

CANONICAL_SKILL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # -------------------------------------------------------------------------
    # APPAREL, MADE-UPS & HOME FURNISHING
    # -------------------------------------------------------------------------
    "SKILL_APPAR_01": {
        "id": "SKILL_APPAR_01",
        "canonical_name": "Basic Machine Stitching",
        "sector": "Apparel, Made-Ups & Home Furnishing",
        "related_nos": ["AMH/N1948", "AMH/N0102", "AMH/N0103"],
        "aliases": [
            "machine stitching", "stitching", "sewing", "தையல்", "தையல் வேலை",
            "सिलाई", "मशीन सिलाई", "స్టిచింగ్", "ಹೊಲಿಗೆ", "সেলাই"
        ]
    },
    "SKILL_APPAR_02": {
        "id": "SKILL_APPAR_02",
        "canonical_name": "Fabric Cutting & Marking",
        "sector": "Apparel, Made-Ups & Home Furnishing",
        "related_nos": ["AMH/N1947", "AMH/N0104"],
        "aliases": [
            "fabric cutting", "cutting & marking", "cloth cutting", "துணி வெட்டுதல்",
            "कपड़ा काटना", "కటింగ్", "ಬಟ್ಟೆ ಕತ್ತರಿಸುವುದು"
        ]
    },
    "SKILL_APPAR_03": {
        "id": "SKILL_APPAR_03",
        "canonical_name": "Button & Fastener Fixing",
        "sector": "Apparel, Made-Ups & Home Furnishing",
        "related_nos": ["AMH/N1948", "AMH/N0105"],
        "aliases": ["button fixing", "fastener", "பட்டன் தைத்தல்", "बटन लगाना"]
    },
    "SKILL_APPAR_04": {
        "id": "SKILL_APPAR_04",
        "canonical_name": "Hand & Machine Embroidery",
        "sector": "Apparel, Made-Ups & Home Furnishing",
        "related_nos": ["AMH/N1001", "AMH/N1002"],
        "aliases": [
            "embroidery", "aari work", "zari", "emroidery", "எம்பிராய்டரி",
            "जरी काम", "कढ़ाई", "ఎంబ్రాయిడరీ"
        ]
    },

    # -------------------------------------------------------------------------
    # ELECTRICAL & POWER
    # -------------------------------------------------------------------------
    "SKILL_ELEC_01": {
        "id": "SKILL_ELEC_01",
        "canonical_name": "Domestic Electrical Wiring & Switchgear Installation",
        "sector": "Electrical & Power",
        "related_nos": ["ELE/N6001", "ELE/N6002"],
        "aliases": [
            "house wiring", "electric wiring", "switchboard", "மின் வயரிங்",
            "வீட்டு வயரிங்", "बिजली वायरिंग", "హౌస్ వైరింగ్", "ವೈರಿಂಗ್"
        ]
    },
    "SKILL_ELEC_02": {
        "id": "SKILL_ELEC_02",
        "canonical_name": "Inverter & UPS Maintenance",
        "sector": "Electrical & Power",
        "related_nos": ["ELE/N6003"],
        "aliases": ["inverter installation", "ups repair", "இன்வெர்ட்டர்", "इन्वर्टर रिपेयर"]
    },
    "SKILL_ELEC_03": {
        "id": "SKILL_ELEC_03",
        "canonical_name": "Multimeter Testing & Fault Diagnosis",
        "sector": "Electrical & Power",
        "related_nos": ["ELE/N6002", "ELE/N4601"],
        "aliases": ["multimeter", "voltage testing", "fault finding", "மல்டிமீட்டர்", "मल्टीमीटर"]
    },

    # -------------------------------------------------------------------------
    # GREEN SKILLS & SOLAR RENEWABLE ENERGY
    # -------------------------------------------------------------------------
    "SKILL_SOLAR_01": {
        "id": "SKILL_SOLAR_01",
        "canonical_name": "Solar PV Module Mounting & Structural Installation",
        "sector": "Green Jobs & Renewable Energy",
        "related_nos": ["SGJ/N0101", "SGJ/N0102"],
        "aliases": [
            "solar panel", "solar installation", "pv module", "சோலார் பேனல்",
            "சூரிய மின்சக்தி", "सोलर पैनल इंस्टॉलेशन", "సోలార్ ప్యానెల్"
        ]
    },
    "SKILL_SOLAR_02": {
        "id": "SKILL_SOLAR_02",
        "canonical_name": "Solar Inverter & DC-AC Cabling",
        "sector": "Green Jobs & Renewable Energy",
        "related_nos": ["SGJ/N0103"],
        "aliases": ["solar wiring", "dc cabling", "solar inverter", "சோலார் வயரிங்"]
    },

    # -------------------------------------------------------------------------
    # AUTOMOTIVE & ELECTRIC VEHICLES (EV)
    # -------------------------------------------------------------------------
    "SKILL_AUTO_01": {
        "id": "SKILL_AUTO_01",
        "canonical_name": "Two-Wheeler Engine & Transmission Servicing",
        "sector": "Automotive",
        "related_nos": ["ASC/N1411", "ASC/N1412"],
        "aliases": [
            "bike mechanic", "two wheeler repair", "motorcycle service", "டூவீலர் மெக்கானிக்",
            "பைக் ரிப்பேர்", "बाइक मैकेनिक", "టూ వీలర్ రిపేర్"
        ]
    },
    "SKILL_AUTO_02": {
        "id": "SKILL_AUTO_02",
        "canonical_name": "EV Battery Pack Diagnostics & BMS Testing",
        "sector": "Automotive",
        "related_nos": ["ASC/N1901", "ASC/N1902"],
        "aliases": [
            "ev battery", "electric scooter repair", "bms testing", "இவி பேட்டரி",
            "மின்சார வாகனம்", "ईवी बैटरी रिपेयर"
        ]
    },

    # -------------------------------------------------------------------------
    # CONSTRUCTION & PLUMBING
    # -------------------------------------------------------------------------
    "SKILL_CONST_01": {
        "id": "SKILL_CONST_01",
        "canonical_name": "Brick Masonry & Plastering",
        "sector": "Construction",
        "related_nos": ["CON/N0102", "CON/N0103"],
        "aliases": [
            "masonry", "brick work", "plastering", "கொத்து வேலை", "கட்டிட வேலை",
            "राजमिस्त्री", "मेसन", "మేస్త్రీ పని"
        ]
    },
    "SKILL_PLUMB_01": {
        "id": "SKILL_PLUMB_01",
        "canonical_name": "Plumbing Pipe Fitting & Sanitary Installation",
        "sector": "Plumbing",
        "related_nos": ["PSC/N0104", "PSC/N0105"],
        "aliases": [
            "plumbing", "pipe fitting", "water tap repair", "பிளம்பிங்",
            "குழாய் வேலை", "नलसाजी", "प्लम्बर", "ప్లంబింగ్"
        ]
    },

    # -------------------------------------------------------------------------
    # HEALTHCARE & ALLIED
    # -------------------------------------------------------------------------
    "SKILL_HEALTH_01": {
        "id": "SKILL_HEALTH_01",
        "canonical_name": "Patient Vitals Monitoring & Bedside Care",
        "sector": "Healthcare",
        "related_nos": ["HSS/N5101", "HSS/N5102"],
        "aliases": [
            "patient care", "nurse assistant", "bp sugar check", "நோயாளிகள் கவனிப்பு",
            "நர்சிங் உதவியாளர்", "मरीज की देखभाल", "నర్సింగ్ సహాయకుడు"
        ]
    },

    # -------------------------------------------------------------------------
    # BEAUTY & WELLNESS
    # -------------------------------------------------------------------------
    "SKILL_BEAUTY_01": {
        "id": "SKILL_BEAUTY_01",
        "canonical_name": "Facial Treatments, Skin Care & Bleaching",
        "sector": "Beauty & Wellness",
        "related_nos": ["BWS/N0102", "BWS/N0103"],
        "aliases": [
            "beauty parlour", "skin care", "facial", "makeup", "பியூட்டி பார்லர்",
            "முக ஒப்பனை", "ब्यूटी पार्लर", "సౌందర్య పోషణ"
        ]
    },

    # -------------------------------------------------------------------------
    # AGRICULTURE & IRRIGATION
    # -------------------------------------------------------------------------
    "SKILL_AGRI_01": {
        "id": "SKILL_AGRI_01",
        "canonical_name": "Micro-Irrigation & Drip System Installation",
        "sector": "Agriculture",
        "related_nos": ["AGR/N1201", "AGR/N1202"],
        "aliases": [
            "drip irrigation", "sprinkler", "farm watering", "சொட்டு நீர் பாசனம்",
            "விவசாய பைப்", "ड्रिप सिंचाई", "బిందు సేద్యం"
        ]
    },
    "SKILL_AGRI_02": {
        "id": "SKILL_AGRI_02",
        "canonical_name": "Organic Soil Enrichment & Bio-Pesticide Preparation",
        "sector": "Agriculture",
        "related_nos": ["AGR/N1203", "AGR/N1204"],
        "aliases": [
            "organic farming", "vermicompost", "bio fertilizer", "இயற்கை விவசாயம்",
            "உரம் தயாரிப்பு", "जैविक खेती", "సేంద్రీయ వ్యవసాయం"
        ]
    },

    # -------------------------------------------------------------------------
    # IT-BPM & ELECTRONICS
    # -------------------------------------------------------------------------
    "SKILL_IT_01": {
        "id": "SKILL_IT_01",
        "canonical_name": "Data Entry & Office Spreadsheet Documentation",
        "sector": "IT-ITeS",
        "related_nos": ["SSC/N2212", "SSC/N0110"],
        "aliases": [
            "data entry", "excel", "typing", "computer operator", "டேட்டா என்ட்ரி",
            "கணினி தட்டச்சு", "डेटा एंट्री", "డేటా ఎంట్రీ"
        ]
    },
    "SKILL_IT_02": {
        "id": "SKILL_IT_02",
        "canonical_name": "Smartphone Hardware Repair & Screen Replacement",
        "sector": "Electronics",
        "related_nos": ["ELE/N8104", "ELE/N1201"],
        "aliases": [
            "mobile repair", "phone display", "soldering", "செல்போன் சர்வீஸ்",
            "மொபைல் ரிப்பேர்", "मोबाइल रिपेयर", "మొబైల్ రిపేరింగ్"
        ]
    },

    # -------------------------------------------------------------------------
    # FOUNDATIONAL & ENTREPRENEURIAL
    # -------------------------------------------------------------------------
    "SKILL_ENTR_01": {
        "id": "SKILL_ENTR_01",
        "canonical_name": "Digital Payments & UPI Transactions",
        "sector": "Foundational & Entrepreneurship",
        "related_nos": ["DGT/VSQ/N0102", "MEPSC/N0102"],
        "aliases": ["upi", "gpay", "phonepe", "digital payment", "டிஜிட்டல் பணம்", "यूपीआई", "యూపీఐ"]
    },
    "SKILL_ENTR_02": {
        "id": "SKILL_ENTR_02",
        "canonical_name": "Customer Communication & Consultation",
        "sector": "Foundational & Entrepreneurship",
        "related_nos": ["MEPSC/N0101"],
        "aliases": ["customer talk", "client consultation", "வாடிக்கையாளர் தொடர்பு", "ग्राहक सेवा"]
    },
    "SKILL_SAFETY_01": {
        "id": "SKILL_SAFETY_01",
        "canonical_name": "Workplace Safety & Hazard Protection",
        "sector": "Cross-Sectoral Safety",
        "related_nos": ["DGT/VSQ/N0101"],
        "aliases": ["safety", "ppe", "fire safety", "பாதுகாப்பு விதிமுறைகள்", "सुरक्षा नियम"]
    }
}


def normalize_skill_name(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Matches raw skill text (or multi-lingual keyword) to canonical skill taxonomy.
    Returns canonical skill dict or a clean fallback record.
    """
    if not raw_text:
        return None
    cleaned = raw_text.lower().strip()
    
    # Exact or alias match
    for skill_id, skill in CANONICAL_SKILL_TAXONOMY.items():
        if cleaned == skill["canonical_name"].lower():
            return skill
        for alias in skill["aliases"]:
            if alias.lower() in cleaned or cleaned in alias.lower():
                return skill

    # Fallback to sanitized raw skill
    return {
        "id": f"SKILL_CUSTOM_{abs(hash(cleaned)) % 10000:04d}",
        "canonical_name": raw_text.strip().title(),
        "sector": "General / Uncategorized",
        "related_nos": [],
        "aliases": [cleaned]
    }


def normalize_candidate_skills(skill_list: List[str]) -> List[Dict[str, Any]]:
    """Normalizes an entire list of candidate skills into canonical records."""
    normalized = []
    seen_ids = set()
    for s in skill_list:
        record = normalize_skill_name(s)
        if record and record["id"] not in seen_ids:
            seen_ids.add(record["id"])
            normalized.append(record)
    return normalized
