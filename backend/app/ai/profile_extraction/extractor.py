import re
from typing import Tuple, List, Dict, Any
from app.schemas.ai import ExtractedProfileData

# Education patterns (English, Tamil, Hindi, etc.)
EDUCATION_PATTERNS = [
    (r'(?:completed|passed|studied\s+up\s+to|studied)\s+(?:12th|twelfth|\+2|plus\s+two|higher\s+secondary)', "12th Standard", "Higher Secondary Certificate (HSC)"),
    (r'12-(?:ம்|ஆம்)\s+வகுப்பு|பிளஸ்\s+டூ|மேல்நிலைப்பள்ளி', "12th Standard", "Higher Secondary Certificate (HSC)"),
    (r'12(?:वीं|वी)|बारहवीं|इंटर(?:मीडिएट)?|उच्चतर\s+माध्यमिक|प्लस\s+टू', "12th Standard", "Higher Secondary Certificate (HSC)"),
    (r'12వ\s*తరగతి|12ನೇ\s*ತರಗತಿ|പ്ലസ്\s*ടു|१२वी|দ্বাদশ\s*শ্রেণী|12મું\s*ધોરણ|12ਵੀਂ\s*ਜਮਾਤ|ଦ୍ୱାଦଶ\s*ଶ୍ରେଣୀ', "12th Standard", "Higher Secondary Certificate (HSC)"),
    
    (r'(?:completed|passed|studied\s+up\s+to|studied)\s+(?:10th|tenth|sslc|matric)', "10th Standard", "Secondary School Leaving Certificate (SSLC)"),
    (r'10-(?:ம்|ஆம்)\s+வகுப்பு|எஸ்எஸ்எல்சி', "10th Standard", "Secondary School Leaving Certificate (SSLC)"),
    (r'10(?:वीं|वी)|दसवीं|मैट्रिक|हाई\s*स्कूल', "10th Standard", "Secondary School Leaving Certificate (SSLC)"),
    (r'10వ\s*తరగతి|10ನೇ\s*ತರಗತಿ|പത്താം\s*ക്ലാസ്|१०वी|দশম\s*শ্রেণী|10મું\s*ધોરણ|10ਵੀਂ\s*ਜਮਾਤ|ଦଶମ\s*ଶ୍ରେଣୀ', "10th Standard", "Secondary School Leaving Certificate (SSLC)"),
    
    (r'diploma\s+(?:in\s+)?([a-zA-Z\s]+)?', "Diploma", "Polytechnic / Technical Diploma"),
    (r'டிப்ளமோ|डिप्लोमा|డిప్లొమా|ಡಿಪ್ಲೊಮಾ|ഡിപ്ലോമ|डिप্লোমা|ડિપ્લોમા|ਡਿਪਲੋਮਾ|ଡିପ୍ଲୋମା', "Diploma", "Polytechnic / Technical Diploma"),
    
    (r'iti\s+(?:in\s+)?([a-zA-Z\s]+)?|आईटीआई|ஐடிஐ', "ITI", "Industrial Training Institute Certificate"),
    (r'graduate|b\.?tech|b\.?e|b\.?sc|b\.?com|பட்டப்படிப்பு|स्नातक|గ్రాడ్యుయేట్', "Graduate Degree", "Bachelor's Degree"),
    (r'8th\s+standard|8-(?:ம்|ஆம்)\s+வகுப்பு|8वीं|आठवीं', "8th Standard", "Middle School"),
]

# Experience duration patterns
EXPERIENCE_PATTERNS = [
    (r'(\d+(?:\.\d+)?)\s*(?:years?|yrs?|வருடம்|வருடங்கள்|ஆண்டுகள்|साल|वर्ष|సంవత్సరాలు|ವರ್ಷ|വർഷം|वर्षे|বছর|વર્ષ|ਸਾਲ|ବର୍ଷ)', lambda m: float(m.group(1))),
    (r'(?:one|1)\s+year|एक\s+साल|ஒரு\s+வருடம்|ఒక\s+సంవత్సరం|ಒಂದು\s+ವರ್ಷ', lambda m: 1.0),
    (r'(?:two|2)\s+years|दो\s+साल|இரண்டு\s+வருடம்|రెండు\s+సంవత్సరాలు|ಎರಡು\s+ವರ್ಷ', lambda m: 2.0),
    (r'(?:three|3)\s+years|तीन\s+साल|மூன்று\s+வருடம்', lambda m: 3.0),
    (r'(?:four|4)\s+years|चार\s+साल', lambda m: 4.0),
    (r'(?:five|5)\s+years|पांच\s+साल', lambda m: 5.0),
    (r'(\d+)\s*(?:months?|மாதங்கள்|महीने|నెలలు|ತಿಂಗಳು|മാസം|महिने|মাস|મહિના|ਮਹੀਨੇ|ମାସ)', lambda m: round(float(m.group(1)) / 12.0, 1)),
    (r'ஒன்றரை\s+வருடம்|डेढ़\s+साल|1\.5\s+years?|1\.5\s+साल', lambda m: 1.5),
    (r'இரண்டு\s+வருடம்|2\s+வருடம்', lambda m: 2.0),
]

# Occupation indicators
OCCUPATION_PATTERNS = [
    (r'tailor(?:ing)?(?:\s+shop|\s+assistant|\s+boutique)?|தையல்|सिलाई|दर्जी|कुर्ती|ब्लाउज़|టైలరిಂಗ್|కుట్టు|ಹೊಲಿಗೆ|തയ്യൽ|टेलरिंग|সেলাই|સિલાઈ|ਸਿਲਾਈ|ଟେଲରିଂ', "Tailoring / Apparel Stitching"),
    (r'electrician(?:\s+helper)?|electrical\s+work|வயரிங்|மின்பழுது|इलेक्ट्रीशियन|बिजली|वायरिंग|ఎలక్ట్రీషియన్|వైరింగ్|ಎಲೆಕ್ಟ್ರಿಷಿಯನ್|ഇലക്ട്രീഷ്യൻ|इलेक्ट्रिशियन|ইলেকট্রিশিয়ান|ઇલેક્ટ્રિશિયન|ਇਲੈਕਟ੍ਰੀਸ਼ੀਅਨ|ଇଲେକ୍ଟ୍ରିସିଆନ୍', "Domestic Electrician Assistant"),
    (r'motorcycle|bike\s+mechanic|இருசக்கர\s+வாகனம்|बाइक\s*रिपेयर|मैकेनिक|ಬೈಕ್|മെക്കാനിക്|বাইক', "Two-Wheeler Mechanical Servicing"),
    (r'solar|சூரிய\s+மின்சாரம்|सोलर|सौर\s*ऊर्जा|ಸೌರ', "Solar Panel Installation"),
    (r'data\s+entry|office\s+clerk|excel|கணினி|டேட்டா\s+என்ட்ரி|डेटा\s*एंट्री|कंप्यूटर|ఎక్సెల్|ಕಂಪ್ಯೂಟರ್|ഡാറ്റാ\s*എൻട്രി|কম্পিউটার|કમ્પ્યુટર|ਕੰਪਿਊਟਰ|କମ୍ପ୍ୟୁଟର', "Data Operations & Office Assistant"),
    (r'plumb(?:er|ing)|குழாய்\s+பழுது|प्लंबर|नल\s*फिटिंग', "Plumbing & Piping Technician"),
    (r'weld(?:er|ing)|வெல்டிங்|वेल्डिंग', "Welding & Fabrication"),
]

# Resource keywords
RESOURCE_KEYWORDS = [
    ("sewing machine", [
        "sewing machine", "stitching machine", "தையல் இயந்திரம்", "தையல் மெஷின்", 
        "सिलाई मशीन", "కుట్టు మిషన్", "ಹೊಲಿಗೆ ಯಂತ್ರ", "തയ്യൽ മെഷീൻ", "शिलाई मशीन", 
        "সেলাই মেশিন", "સિલાઈ મશીન", "ਸਿਲਾਈ ਮਸ਼ੀਨ", "ସିଲେଇ ମେସିନ୍"
    ]),
    ("measuring kit & tools", [
        "measuring kit", "measuring tape", "pattern paper", "அளவு நாடா", "கத்தரிக்கோல்",
        "नापने का टेप", "इंची टेप", "कैंची", "కొలత టేప్", "ಕತ್ತರಿ", "അളവ് ടേപ്പ്", "कात्री", "ফিতা", "કાતર"
    ]),
    ("smartphone with UPI", [
        "smartphone", "mobile with upi", "phonepe", "gpay", "ஸ்மார்ட்போன்", "மொபைல் போன்",
        "स्मार्टफोन", "मोबाइल", "यूपीआई", "फोनपे", "गूगलपे", "స్మార్ట్‌ఫోన్", "ಯುಪಿಐ", "സ്മാർട്ട്ഫോൺ"
    ]),
    ("electrical hand toolset", [
        "hand toolset", "plier", "screw driver", "tester", "கருவிகள்",
        "औज़ार", "पेचकस", "टेस्टर", "ప్లయర్", "ಸ್ಕ್ರೂಡ್ರೈವರ್", "ടൂളുകൾ", "अवजारे"
    ]),
    ("multimeter", ["multimeter", "digital meter", "மல்டிமீட்டர்", "मल्टीमीटर", "మల్టీమీటర్"]),
    ("laptop / computer", [
        "laptop", "computer", "pc", "மடிக்கணினி", "கணினி", "लैपटॉप", "कंप्यूटर", 
        "ల్యాప్‌టాప్", "ಕಂಪ್ಯೂಟರ್", "ലാപ്‌ടോപ്പ്", "ল্যাপটপ", "લેપટોપ", "ਲੈਪਟਾਪ"
    ]),
    ("broadband internet", ["broadband", "wifi", "internet", "இணைய வசதி", "इंटरनेट", "వైఫై", "ಇಂಟರ್ನೆಟ್"]),
    ("two-wheeler vehicle", ["two-wheeler", "bike", "motorcycle", "பைக்", "இருசக்கர வாகனம்", "बाइक", "मोटरसाइकिल", "బైక్", "ದ್ವಿಚಕ್ರ"]),
]

# Constraints keywords
CONSTRAINT_KEYWORDS = [
    ("cannot travel far / localized within 5km", [
        "cannot travel", "within 5km", "close to home", "அதிக தூரம் பயணிக்க முடியாது", "உள்ளூரிலேயே",
        "दूर नहीं जा सकते", "5 किमी", "घर के पास", "ఎక్కువ దూరం ప్రయాణించలేను", "ದೂರ ಪ್ರಯಾಣಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ",
        "യാത്ര ബുദ്ധിമുട്ടാണ്", "जास्त लांब प्रवास नाही", "দূরে যাওয়া সম্ভব নয়", "દૂર મુસાફરી નથી"
    ]),
    ("flexible daytime / afternoon hours only", [
        "afternoon", "flexible hours", "part time", "நேர வரம்பு", "பிற்பகல் நேரம்",
        "दिन का समय", "दोपहर", "पार्ट टाइम", "పగటి వేళల్లో", "ಹಗಲು ಪಾಳಿ", "പകൽ സമയം", "दिवसा"
    ]),
    ("home-based only due to caregiving", [
        "family responsibilities", "child care", "home bound", "குடும்ப சூழ்நிலை", "வீட்டிலிருந்தே",
        "पारिवारिक जिम्मेदारियां", "घर से ही", "కుటుంబ బాధ్యతలు", "ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿ", "കുടುಂಬം", "कौटुंबिक जबाबदाऱ्या"
    ]),
]


def extract_structured_profile(text: str) -> Tuple[ExtractedProfileData, List[str]]:
    """
    Extracts structured profile attributes strictly from natural language text across all Indian languages.
    Never invents unstated facts; unmentioned fields are marked 'unknown'.
    """
    if not text:
        empty_profile = ExtractedProfileData(
            education="unknown",
            qualification="unknown",
            experience_years=0.0,
            prior_occupation="unknown",
            livelihood_goal="unknown",
            work_preference="flexible",
            interests=[],
            resources=[],
            constraints=[]
        )
        return empty_profile, ["education", "experience", "prior_occupation", "livelihood_goal", "resources"]

    lowered = text.lower()
    unresolved: List[str] = []

    # 1. Education extraction
    education = "unknown"
    qualification = "unknown"
    for pattern, edu_name, qual_name in EDUCATION_PATTERNS:
        if re.search(pattern, lowered):
            education = edu_name
            qualification = qual_name
            break
    if education == "unknown":
        unresolved.append("education")

    # 2. Experience years
    experience_years = 0.0
    for pattern, parser in EXPERIENCE_PATTERNS:
        match = re.search(pattern, lowered)
        if match:
            try:
                experience_years = parser(match)
                break
            except Exception:
                continue

    # 3. Prior occupation
    prior_occupation = "unknown"
    for pattern, occ_name in OCCUPATION_PATTERNS:
        if re.search(pattern, lowered):
            prior_occupation = occ_name
            break
    if prior_occupation == "unknown":
        unresolved.append("prior_occupation")

    # 4. Livelihood goal & work preference
    livelihood_goal = "unknown"
    work_preference = "flexible"

    self_employment_triggers = [
        "earn from home", "home business", "self-employment", "self employment", "own business", "boutique", 
        "சொந்த தொழில்", "சுயதொழில்", "வீட்டிலிருந்தே",
        "स्वरोज़गार", "घर से काम", "खुद का काम", "बुटीक", "अपना व्यवसाय", "घर से कमाई",
        "స్వయం ఉపాధి", "ఇంటి నుండే", "ಸ್ವಯಂ ಉದ್ಯೋಗ", "സ്വയംതൊഴിൽ", "स्वयंरोजगार", "স্বনির্ভর", "સ્વરોજગાર", "ਸਵੈ-ਰੋਜ਼ਗਾਰ", "ସ୍ୱୟଂ ରୋଜଗାର"
    ]
    wage_employment_triggers = [
        "job", "company", "wage", "technician job", "factory", 
        "வேலை", "நிறுவன வேலை", "नौकरी", "कंपनी", "वेतनभोगी", "तकनीशियन नौकरी", 
        "ఉద్యోగం", "ನೌಕರಿ", "ജോലി", "नोकरी", "চাকরি", "નોકરી", "ਨੌਕਰੀ", "ଚାକିରି"
    ]

    if any(k in lowered for k in self_employment_triggers):
        livelihood_goal = "self-employment"
        work_preference = "home-based"
    elif any(k in lowered for k in wage_employment_triggers):
        livelihood_goal = "employment"
        work_preference = "field / facility"
    else:
        unresolved.append("livelihood_goal")

    # 5. Resources detection
    detected_resources = []
    for canonical_res, triggers in RESOURCE_KEYWORDS:
        if any(trig in lowered for trig in triggers):
            detected_resources.append(canonical_res)

    # 6. Constraints detection
    detected_constraints = []
    for canonical_const, triggers in CONSTRAINT_KEYWORDS:
        if any(trig in lowered for trig in triggers):
            detected_constraints.append(canonical_const)

    # Work history summary object if experience exists
    work_history = []
    if prior_occupation != "unknown" and experience_years > 0:
        work_history.append({
            "occupation": prior_occupation,
            "duration_years": experience_years,
            "description": f"Worked approximately {experience_years} year(s) in {prior_occupation}."
        })

    profile_data = ExtractedProfileData(
        education=education,
        qualification=qualification,
        experience_years=experience_years,
        prior_occupation=prior_occupation,
        work_history=work_history,
        resources=detected_resources,
        constraints=detected_constraints,
        livelihood_goal=livelihood_goal,
        work_preference=work_preference,
        interests=[prior_occupation] if prior_occupation != "unknown" else []
    )

    # Dual-Engine: If there are unresolved fields, invoke LLM / semantic engine
    if unresolved:
        from app.ai.profile_extraction.llm_extractor import refine_with_llm
        profile_data = refine_with_llm(text, profile_data, unresolved)
        # Update unresolved list
        updated_unresolved = []
        if profile_data.education == "unknown": updated_unresolved.append("education")
        if profile_data.prior_occupation == "unknown": updated_unresolved.append("prior_occupation")
        if profile_data.experience_years == 0: updated_unresolved.append("experience_years")
        if profile_data.livelihood_goal == "unknown": updated_unresolved.append("livelihood_goal")
        unresolved = updated_unresolved

    return profile_data, unresolved

