import re
from typing import List, Dict, Any, Set
from app.schemas.ai import ExtractedSkill

# Comprehensive Canonical Skill Taxonomy with multilingual triggers (English, Tamil, Hindi)
CANONICAL_SKILL_CATALOG = [
    # --- Apparel & Tailoring Sector ---
    {
        "canonical_name": "Basic Machine Stitching",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "basic stitching", "stitching", "machine stitching", "sewing", "sew clothes", "tailoring",
            "தையல்", "தைக்க தெரியும்", "தையல் வேலை", "துணி தைத்தல்",
            "सिलाई", "मशीन सिलाई", "कपड़े की सिलाई", "सिलाई काम", "कुట్టు పని", "ಹೊಲಿಗೆ"
        ]
    },
    {
        "canonical_name": "Fabric Cutting & Marking",
        "category": "technical",
        "proficiency": "basic",
        "triggers": [
            "fabric cutting", "cutting cloth", "pattern marking", "scissor cutting", "measuring fabric",
            "துணி வெட்டுதல்", "அளவு எடுத்தல்", "மார்க் செய்தல்",
            "कपड़े की कटाई", "कटिंग", "नाप लेना", "मार्किंग", "కట్టింగ్", "ಬಟ್ಟೆ கத்தரிப்பது"
        ]
    },
    {
        "canonical_name": "Button & Fastener Fixing",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "button", "zipper", "fastener", "fixing buttons", "கொக்கி தைத்தல்", "பொத்தான்",
            "बटन लगाना", "ज़िप लगाना", "बटन"
        ]
    },
    {
        "canonical_name": "Embroidery & Embellishment",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "embroidery", "hand work", "aari work", "zari", "zardosi", "எம்பிராய்டரி", "ஆரி வேலை",
            "கற்கள் பதித்தல்", "कढ़ाई", "जरी काम", "हाथ का काम", "कसीदाकारी"
        ]
    },

    # --- Electrical & Electronics Sector ---
    {
        "canonical_name": "Domestic Electrical Wiring",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "wiring", "electrical wiring", "conduit wiring", "house wiring", "electrician", 
            "வயரிங்", "மின்சார வேலை", "வீட்டு வயரிங்", "எலக்ட்ரீசியன்",
            "वायरिंग", "बिजली का काम", "इलेक्ट्रीशियन", "हाउस वायरिंग", "వైரிங்"
        ]
    },
    {
        "canonical_name": "Switchboard Installation & Testing",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "switchboard", "switches", "mcb", "fuse replacement", "சுவிட்ச் போர்டு", "சுவிட்ச் மாட்டுதல்",
            "स्विचबोर्ड", "स्विच लगाना", "एमसीबी", "फ्यूज"
        ]
    },
    {
        "canonical_name": "Electrical Continuity & Multimeter Testing",
        "category": "technical",
        "proficiency": "basic",
        "triggers": [
            "multimeter", "continuity test", "tester", "voltage check", "டெஸ்டர்", "மீட்டர் சோதனை",
            "மின்னழுத்தம்", "मल्टीमीटर", "टेस्टर", "वोल्टेज जांच"
        ]
    },
    {
        "canonical_name": "Mobile Hardware Repair & Diagnostics",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "mobile repair", "phone repair", "screen replacement", "microsoldering", "charging port repair",
            "மொபைல் பழுது", "போன் ரிப்பேர்", "டிஸ்பிளே மாற்றுதல்",
            "मोबाइल रिपेयर", "फोन मरम्मत", "डिस्प्ले चेंज", "चार्जिंग पिन"
        ]
    },
    {
        "canonical_name": "Computer Hardware & OS Troubleshooting",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "computer hardware", "pc assembly", "laptop repair", "os installation", "printer setup",
            "கணினி பழுது", "லேப்டாப் சர்வீஸ்", "வின்டோஸ் இன்ஸ்டாலேஷன்",
            "कंप्यूटर रिपेयर", "लैपटॉप सर्विस", "हार्डवेयर"
        ]
    },

    # --- Green Jobs & Renewable Energy ---
    {
        "canonical_name": "Solar PV Panel Assembly & Mounting",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "solar panel", "solar installation", "solar pv", "suryamitra", "rooftop solar",
            "சூரிய மின் பலகை", "சோலார் பேனல்", "சூரிய சக்தி",
            "सोलर पैनल", "सौर ऊर्जा", "सोलर इंस्टालेशन", "सूर्यमित्र"
        ]
    },

    # --- Automotive Sector ---
    {
        "canonical_name": "Motorcycle Maintenance & Servicing",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "repair motorcycles", "motorcycle maintenance", "bike repair", "two wheeler repair", 
            "இருசக்கர வாகனம் பழுது", "பைக் சர்வீஸ்", "மெக்கானிக்", "டூ வீலர்",
            "बाइक रिपेयर", "मोटरसाइकिल सर्विसिंग", "टू-व्हीलर रिपेयर", "मैकेनिक"
        ]
    },
    {
        "canonical_name": "Engine Oil & Lubrication Servicing",
        "category": "technical",
        "proficiency": "basic",
        "triggers": [
            "change engine oil", "engine oil", "lubrication", "oil service",
            "ஆயில் மாற்றுதல்", "என்ஜின் ஆயில்", "கிரீஸ் அடித்தல்",
            "इंजन ऑयल", "ऑयल बदलना", "सर्विसिंग"
        ]
    },
    {
        "canonical_name": "Electric Vehicle Battery & Motor Diagnostics",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "ev repair", "electric scooter", "electric vehicle", "bldc motor", "battery pack", "e-rickshaw",
            "மின்சார வாகனம்", "ஈவி பைக்", "பேட்டரி செக்",
            "इलेक्ट्रिक व्हीकल", "ईवी रिपेयर", "ई-रिक्शा", "बैटरी रिपेयर"
        ]
    },
    {
        "canonical_name": "Basic Mechanical Repair & Assembly",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "basic mechanical repair", "vehicle maintenance", "spanner tools", "bolt tightening", "mechanical assembly",
            "நட்டு போல்ட் கழற்றுதல்", "இயந்திர வேலை", "ஸ்பேனர்",
            "मैकेनिकल मरम्मत", "नट बोल्ट", "टूल किट"
        ]
    },

    # --- Plumbing Sector ---
    {
        "canonical_name": "Plumbing Installation & Pipe Fitting",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "plumbing", "pipe fitting", "water pipe", "tap fixing", "drainage", "cpvc", "pvc pipe",
            "பிளம்பிங்", "குழாய் பொருத்துதல்", "தண்ணீர் குழாய்", "பைப்",
            "प्लंबर", "पाइप फिटिंग", "नल रिपेयर", "प्लंबिंग"
        ]
    },

    # --- Construction & Masonry ---
    {
        "canonical_name": "Masonry Construction & Plastering",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "masonry", "brickwork", "plastering", "mason", "cement work", "building construction",
            "கொத்தனார் வேலை", "சுவர் கட்டுதல்", "பூச்சு வேலை", "சிமெண்ட்",
            "राजमिस्त्री", "चिनाई", "प्लास्टर", "कंस्ट्रक्शन"
        ]
    },

    # --- Healthcare & Wellness ---
    {
        "canonical_name": "Patient Care & Vital Signs Monitoring",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "patient care", "nursing", "vital signs", "bp check", "hospital assistant", "caregiving",
            "நோயாளி பராமரிப்பு", "நர்சிங்", "மருத்துவமனை வேலை", "ரத்த அழுத்தம்",
            "मरीज की देखभाल", "नर्सिंग", "बीपी चेक", "अस्पताल"
        ]
    },
    {
        "canonical_name": "Beauty Therapy & Skincare Services",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "beauty parlour", "threading", "waxing", "facial", "makeup", "skin care", "bridal makeup",
            "பியூட்டி பார்லர்", "த்ரெட்டிங்", "மேக்கப்", "ஃபேசியல்",
            "ब्यूटी पार्लर", "थ्रेडिंग", "वैक्सिंग", "मेकअप", "फेशियल"
        ]
    },

    # --- Agriculture ---
    {
        "canonical_name": "Micro-Irrigation & Drip System Installation",
        "category": "technical",
        "proficiency": "intermediate",
        "triggers": [
            "drip irrigation", "sprinkler", "micro irrigation", "farming pipe", "irrigation system",
            "சொட்டு நீர் பாசனம்", "விவசாய குழாய்", "ஸ்பிரிங்க்ளர்",
            "ड्रिप इरिगेशन", "टपक सिंचाई", "फव्वारा सिंचाई", "कृषि"
        ]
    },

    # --- IT, Data & Digital Skills ---
    {
        "canonical_name": "Spreadsheet Management & Formulas",
        "category": "digital",
        "proficiency": "intermediate",
        "triggers": [
            "excel", "spreadsheets", "excel formulas", "ms office", "google sheets",
            "கணினி", "எக்செல்", "கம்ப்யூட்டர்",
            "एक्सेल", "स्प्रेडशीट", "कंप्यूटर"
        ]
    },
    {
        "canonical_name": "Data Entry & Document Processing",
        "category": "digital",
        "proficiency": "intermediate",
        "triggers": [
            "data entry", "touch typing", "typing", "typing speed", "office clerical",
            "டேட்டா என்ட்ரி", "தட்டச்சு", "ஆவண தட்டச்சு",
            "डेटा एंट्री", "टाइपिंग"
        ]
    },
    {
        "canonical_name": "Digital Payments & UPI Transactions",
        "category": "digital",
        "proficiency": "intermediate",
        "triggers": [
            "digital payments", "upi", "google pay", "phonepe", "paytm", "online payment", "qr code payments",
            "கூகுள் பே", "போன்பே", "டிஜிட்டல் பணம்", "யுபிஐ",
            "डिजिटल भुगतान", "यूपीआई", "गूगल पे", "फोनपे", "ऑनलाइन पेमेंट"
        ]
    },

    # --- Soft & Foundational Skills ---
    {
        "canonical_name": "Customer Communication & Consultation",
        "category": "soft",
        "proficiency": "basic",
        "triggers": [
            "customer fitting", "customer communication", "talking to clients", "sales", "client handling",
            "வாடிக்கையாளர்", "வாடிக்கையாளர் பேச்சு", "விற்பனை",
            "ग्राहक सेवा", "ग्राहकों से बात", "बिक्री"
        ]
    },
    {
        "canonical_name": "Workplace Safety & Hazard Protection",
        "category": "safety",
        "proficiency": "intermediate",
        "triggers": [
            "safety equipment", "tool safety", "insulated gloves", "safety goggles", "hazard protection",
            "பாதுகாப்பு முறைகள்", "பாதுகாப்பு உபகரணங்கள்",
            "सुरक्षा उपकरण", "दस्ताने", "सुरक्षा नियम"
        ]
    }
]


def extract_and_normalize_skills(text: str) -> List[ExtractedSkill]:
    """
    Extracts and maps natural language expressions into canonical skill catalog.
    Uses regex boundary matching to prevent spurious substring hits.
    Never invents unmentioned skills.
    """
    if not text:
        return []

    lowered_text = text.lower()
    extracted_skills: List[ExtractedSkill] = []
    seen_canonical: Set[str] = set()

    for item in CANONICAL_SKILL_CATALOG:
        canonical_name = item["canonical_name"]
        if canonical_name in seen_canonical:
            continue

        for trigger in item["triggers"]:
            trig_lower = trigger.lower()
            # If trigger has multiple words, plain substring is safe;
            # If short single word (<= 4 chars), use word boundaries
            if len(trig_lower) > 4:
                matched = trig_lower in lowered_text
            else:
                pattern = rf'(?:\b|_){re.escape(trig_lower)}(?:\b|_)'
                matched = bool(re.search(pattern, lowered_text))

            if matched:
                extracted_skills.append(
                    ExtractedSkill(
                        skill_name=trigger.strip().title(),
                        canonical_name=canonical_name,
                        category=item["category"],
                        proficiency_level=item["proficiency"],
                        confidence=0.92,
                        source_snippet=f"Identified from expression: '{trigger}'"
                    )
                )
                seen_canonical.add(canonical_name)
                break

    return extracted_skills
