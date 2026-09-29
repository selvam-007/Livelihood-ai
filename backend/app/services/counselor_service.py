import os
import json
import logging
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.parse

logger = logging.getLogger("LivelihoodAI.Counselor")

# 11 Indian Languages Metadata
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "mr": "Marathi (मराठी)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાతી)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)"
}

# =============================================================================
# COMPREHENSIVE DOMAIN KNOWLEDGE BASE
# =============================================================================
KNOWLEDGE_BASE = {
    "nsqf_levels": {
        "title": "National Skills Qualifications Framework (NSQF)",
        "summary": (
            "NSQF organizes qualifications across 10 levels based on knowledge, skills, and aptitude.\n"
            "- Level 1: Foundational/helper roles requiring basic repetitive tasks, minimal schooling.\n"
            "- Level 2: Introductory manual skills with basic comprehension and tool safety.\n"
            "- Level 3: Domestic technician roles (e.g. Domestic Wireman, Assistant Apparel Finisher) — practical problem-solving. Typical qualification: 10th Standard/SSLC.\n"
            "- Level 4: Self-employed artisan/skilled craftsman (e.g. Self-Employed Tailor, Rooftop Solar PV Technician, Domestic Electrician). Typical: 10th–12th Standard.\n"
            "- Level 5: Advanced technical associates (e.g. AI Associate Engineer, CRM Data Operations, Industrial Automation Technician). Typical: 12th/ITI/Diploma.\n"
            "- Level 6: Specialist supervisors, senior technicians, workshop managers. Typical: Diploma/Degree.\n"
            "- Level 7: Junior engineers, system integrators, team leads. Typical: Degree.\n"
            "- Level 8–10: Engineering graduates, master specialists, research associates.\n"
            "Each level has nationally defined Qualification Packs (QPs) and National Occupational Standards (NOS) registered with NCVET."
        )
    },
    "rpl": {
        "title": "Recognition of Prior Learning (RPL)",
        "summary": (
            "RPL formally certifies informal learning and on-the-job experience without repeating schooling.\n"
            "- Who is eligible: Anyone with 2+ years of informal work experience in a trade.\n"
            "- Process: 12-hour orientation + practical/theory assessment by an accredited assessor.\n"
            "- Outcome: Government-recognized NSQF certificate at Level 3 or 4 based on skill demonstrated.\n"
            "- Benefits: Resume credibility, access to PMKVY stipends, priority in scheme loan eligibility.\n"
            "- No minimum education required for RPL Level 3 and 4 assessments.\n"
            "- Funded 100% under PMKVY 4.0 — candidate pays nothing."
        )
    },
    "schemes": {
        "PMKVY": (
            "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0):\n"
            "- 100% government-funded short-term skilling and RPL certification.\n"
            "- Direct wage allowance/stipend paid to candidate during training.\n"
            "- Covers 500+ job roles aligned to NSQF Levels 3–5.\n"
            "- Training duration: 150–300 hours depending on QP.\n"
            "- Post-training placement support and employer linkages.\n"
            "- Apply: pmkvyofficial.org or through nearest Skill India training partner."
        ),
        "PM_Vishwakarma": (
            "PM Vishwakarma Scheme (2023–28):\n"
            "- For 18 traditional artisan/craftsperson categories: tailors, carpenters, blacksmiths, potters, cobblers, barbers, goldsmiths, weavers, and more.\n"
            "- Benefits: Free 5-day basic training + 15-day advanced training.\n"
            "- ₹15,000 toolkit incentive deposited directly to bank account.\n"
            "- Collateral-free enterprise loan: ₹1 Lakh (Tranche 1) + ₹2 Lakh (Tranche 2) at only 5% interest.\n"
            "- PM Vishwakarma digital ID and certificate issued.\n"
            "- Eligibility: Traditional artisan working with hands/tools, minimum 18 years old.\n"
            "- Apply: pmvishwakarma.gov.in or Common Service Centre (CSC)."
        ),
        "NAPS": (
            "National Apprenticeship Promotion Scheme (NAPS):\n"
            "- On-the-job industry training with monthly stipend co-funded by Central Government.\n"
            "- Government pays 25% of stipend (min ₹1500/month) directly to apprentice.\n"
            "- Duration: 6 months to 3 years in registered establishments.\n"
            "- Leads to NCVET/NCVT apprenticeship certificate.\n"
            "- Apply: apprenticeshipindia.gov.in"
        ),
        "Mudra": (
            "Pradhan Mantri MUDRA Yojana:\n"
            "- Micro-enterprise loans for certified/skilled technicians starting their own business.\n"
            "- Shishu: Up to ₹50,000 (for startups, no collateral).\n"
            "- Kishore: ₹50,001 to ₹5 Lakh.\n"
            "- Tarun: ₹5 Lakh to ₹10 Lakh.\n"
            "- No collateral or guarantor required for Shishu & Kishore.\n"
            "- Apply through any nationalized bank, MFI, or NBFC with your NSQF certificate."
        ),
        "DDUGKY": (
            "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY):\n"
            "- Rural youth skill development and placement programme.\n"
            "- Focuses on youth aged 15–35 years from poor rural families.\n"
            "- Free training + food + accommodation + placement guarantee.\n"
            "- Minimum 70% placement commitment by training partner.\n"
            "- Apply through State Rural Livelihood Missions (SRLM)."
        )
    },
    "website_features": {
        "voice_assessment": (
            "Voice Input / Assessment:\n"
            "- Speak naturally in any of 11 Indian languages (no written resume needed).\n"
            "- Our speech AI transcribes and extracts your genuine skills, experience, and education automatically.\n"
            "- Works offline or on low-bandwidth connections.\n"
            "- Supports Tanglish, Hinglish, and mixed vernacular speech.\n"
            "- How to use: Go to 'Voice Assessment' section → Click the mic button → Speak about your work experience."
        ),
        "profile": (
            "My Profile:\n"
            "- Displays all your verified skills and competencies.\n"
            "- Shows AI-identified skill gaps compared to your target NSQF QP.\n"
            "- Lists your active Qualification Pack (QP) goal and NSQF level target.\n"
            "- Tracks completion percentage across 5 assessment dimensions.\n"
            "- How to use: Click 'Profile' in the top navigation or sidebar."
        ),
        "recommendations": (
            "Recommendations:\n"
            "- AI-matched NSQF bridge courses and training modules tailored to your skill gaps.\n"
            "- Lists eligible government schemes based on your profile (PMKVY, PM Vishwakarma, etc.).\n"
            "- Shows nearby accredited training centres with distance, contact, and availability.\n"
            "- How to use: Navigate to 'Recommendations' from the dashboard or sidebar."
        ),
        "courses": (
            "Training & Courses Catalog:\n"
            "- Full catalog of government-aligned Qualification Packs with:\n"
            "  - Duration, syllabus, eligibility criteria.\n"
            "  - Provider name, district, contact details.\n"
            "  - NSQF level, QP code, NOS units.\n"
            "- Filter by sector, level, or location.\n"
            "- How to use: Visit 'Courses' or 'Catalog' section from the main menu."
        ),
        "progress": (
            "Skill Growth & Progress Roadmap:\n"
            "- 5-stage personalized roadmap:\n"
            "  Stage 1: Baseline Assessment (Voice / Text) → completed automatically.\n"
            "  Stage 2: Skill Gap Analysis → AI compares your skills to target QP.\n"
            "  Stage 3: Bridge Training → Attend recommended courses.\n"
            "  Stage 4: NSQF Certification → RPL or fresh assessment by accredited body.\n"
            "  Stage 5: Placement / Enterprise Launch → Job linkage or MUDRA loan support.\n"
            "- Track your current stage under 'Skill Growth' in the dashboard."
        ),
        "settings": (
            "Settings & Personalization:\n"
            "- Change platform language: 11 Indic languages supported (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia).\n"
            "- Toggle Dark Mode / Light Mode from the navbar (moon/sun icon) or Settings page.\n"
            "- Manage DPDP (Digital Personal Data Protection) data rights — request data deletion.\n"
            "- How to use: Click the gear icon or 'Settings' in the sidebar/navbar."
        ),
        "admin": (
            "Admin Intelligence Dashboard (State Officials only):\n"
            "- Real-time district-level skill demand heatmaps.\n"
            "- Workforce deficit analytics by sector and NSQF level.\n"
            "- Immutable audit logs for all field agent actions.\n"
            "- Export reports in CSV/PDF for government reporting.\n"
            "- Access: Restricted to Admin role accounts only."
        ),
        "loan_calculator": (
            "Scheme & Loan Calculator:\n"
            "- Interactive calculator to estimate your eligible loan amount under MUDRA and PM Vishwakarma.\n"
            "- Shows monthly EMI, interest rate, and repayment schedule.\n"
            "- How to use: Visit 'Schemes' section → Click 'Loan Calculator'."
        )
    },
    "nsqf_qp_examples": {
        "AMH/Q1947": "Self-Employed Tailor (NSQF Level 4) — Apparel, Made-ups & Home Furnishing sector. Skills: Pattern making, cutting, stitching, finishing.",
        "ELE/Q3104": "Domestic Electrician (NSQF Level 4) — Electronics sector. Skills: Domestic wiring, switchboard installation, earthing.",
        "SGJ/Q0101": "Solar PV Installation Technician (NSQF Level 4) — Green Jobs sector. Skills: Panel installation, battery management, DC/AC systems.",
        "IT/Q0105": "Data Entry Operator (NSQF Level 4) — IT-ITeS sector. Skills: Typing, MS Office, data management.",
        "BEW/Q0301": "Beauty Therapist (NSQF Level 4) — Beauty & Wellness sector.",
        "FIC/Q0201": "Refrigeration & Air Conditioning Technician (NSQF Level 4).",
        "CSC/Q0302": "Customer Care Executive (NSQF Level 4) — Telecom sector.",
        "TWL/Q4001": "Two & Three Wheeler Mechanic (NSQF Level 4) — Automotive sector.",
        "PWF/Q5401": "Plumber (NSQF Level 4) — Plumbing sector.",
        "CON/Q0602": "Bar Bender & Steel Fixer (NSQF Level 4) — Construction sector."
    }
}

# Multilingual Vernacular Answer Templates for Offline/Fast Fallback
VERNACULAR_RESPONSES = {
    "nsqf": {
        "en": (
            "**NSQF (National Skills Qualifications Framework)**\n\n"
            "India's national framework that standardizes competency levels:\n"
            "• **Level 1–2**: Entry/Helper — no formal education needed\n"
            "• **Level 3**: Domestic technician (Wireman, Apparel Finisher) — 10th standard\n"
            "• **Level 4**: Skilled artisan (Tailor, Electrician, Solar Technician) — 10th–12th standard\n"
            "• **Level 5**: Advanced associate (AI Engineer, Data Ops) — 12th/Diploma\n"
            "• **Level 6+**: Specialists, supervisors, engineers\n\n"
            "Each level has Qualification Packs (QPs) with National Occupational Standards (NOS) "
            "registered with NCVET. This ensures your skills are recognized across all states."
        ),
        "hi": (
            "**NSQF (राष्ट्रीय कौशल योग्यता ढांचा)**\n\n"
            "भारत का राष्ट्रीय मानक जो कौशल को प्रमाणित करता है:\n"
            "• **स्तर 1–2**: सहायक/प्रवेश स्तर — कोई शिक्षा नहीं चाहिए\n"
            "• **स्तर 3**: घरेलू तकनीशियन (वायरमैन, परिधान सहायक) — 10वीं कक्षा\n"
            "• **स्तर 4**: कुशल कारीगर (दर्जी, बिजली मिस्त्री, सौर तकनीशियन)\n"
            "• **स्तर 5+**: उन्नत तकनीशियन, इंजीनियर\n\n"
            "प्रत्येक स्तर में Qualification Packs (QP) और NOS मानक होते हैं जो NCVET द्वारा मान्यता प्राप्त हैं।"
        ),
        "ta": (
            "**NSQF (தேசிய திறன் தகுதி கட்டமைப்பு)**\n\n"
            "இந்தியாவின் தேசிய தரநிலை, திறன்களை வகைப்படுத்துகிறது:\n"
            "• **நிலை 1–2**: தொடக்க நிலை — எந்த கல்வியும் தேவையில்லை\n"
            "• **நிலை 3**: தொழில்நுட்ப உதவியாளர் (மின்னோட்ட உதவியாளர், ஆடை உதவியாளர்) — 10ஆம் வகுப்பு\n"
            "• **நிலை 4**: திறன்மிக்க கலைஞர் (தையல்காரர், மின்சார திருத்தக்காரர், சூரிய ஆற்றல் தொழில்நுட்பவியலாளர்)\n"
            "• **நிலை 5+**: மேம்பட்ட தொழில்நுட்பவியலாளர்கள்\n\n"
            "ஒவ்வொரு நிலையிலும் Qualification Packs (QP) மற்றும் NOS தரநிலைகள் உள்ளன, NCVET அங்கீகாரம் பெற்றவை."
        ),
        "te": (
            "**NSQF (జాతీయ నైపుణ్య అర్హత చట్రం)**\n\n"
            "భారత జాతీయ ప్రమాణం, నైపుణ్యాలను ప్రామాణీకరిస్తుంది:\n"
            "• **స్థాయి 1–2**: ప్రవేశ స్థాయి\n"
            "• **స్థాయి 3–4**: నైపుణ్య కళాకారుడు (టైలర్, ఎలక్ట్రీషియన్, సోలార్ టెక్నీషియన్)\n"
            "• **స్థాయి 5+**: అధునాతన సహాయకుడు\n\n"
            "ప్రతి స్థాయికి NCVET నమోదిత Qualification Packs ఉన్నాయి."
        ),
        "kn": "**NSQF** ಲೆವಲ್ 1 ರಿಂದ 8+ ವರೆಗೆ ಕೌಶಲ್ಯಗಳನ್ನು ಪ್ರಮಾಣೀಕರಿಸುವ ರಾಷ್ಟ್ರೀಯ ಮಾನದಂಡ. ಪ್ರತಿ ಮಟ್ಟಕ್ಕೆ NCVET ಅನುಮೋದಿತ Qualification Packs ಇದೆ.",
        "ml": "**NSQF** ലെവൽ 1 മുതൽ 8+ വരെ നൈപുണ്യങ്ങളെ വർഗ്ഗീകരിക്കുന്ന ദേശീയ ചട്ടക്കൂട്. ഓരോ ലെവലിനും NCVET അംഗീകൃത Qualification Packs ഉണ്ട്.",
        "mr": "**NSQF** ही स्तर 1 ते 8+ पर्यंत कौशल्यांचे प्रमाणीकरण करणारी राष्ट्रीय चौकट. प्रत्येक स्तरासाठी NCVET मान्यताप्राप्त Qualification Packs आहेत.",
        "bn": "**NSQF** হলো ভারতের জাতীয় কাঠামো যা লেভেল ১ থেকে ৮+ পর্যন্ত দক্ষতা প্রত্যয়িত করে। প্রতিটি স্তরে NCVET অনুমোদিত Qualification Packs রয়েছে।",
        "gu": "**NSQF** એ સ્તર 1 થી 8+ સુધીની કુશળતાને પ્રમાણિત કરતું રાષ્ટ્રીય માળખું. દરેક સ્તર માટે NCVET મંજૂર Qualification Packs છે.",
        "pa": "**NSQF** ਲੈਵਲ 1 ਤੋਂ 8+ ਤੱਕ ਹੁਨਰਾਂ ਨੂੰ ਪ੍ਰਮਾਣਿਤ ਕਰਦਾ ਰਾਸ਼ਟਰੀ ਢਾਂਚਾ। ਹਰ ਲੈਵਲ ਲਈ NCVET ਮਨਜ਼ੂਰ Qualification Packs ਹਨ।",
        "or": "**NSQF** ଲେଭଲ୍ 1 ରୁ 8+ ପର୍ଯ୍ୟନ୍ତ ଦକ୍ଷତା ପ୍ରଦାନ କରୁଥିବା ଜାତୀୟ ଫ୍ରେମୱାର୍କ।"
    },
    "rpl": {
        "en": (
            "**RPL (Recognition of Prior Learning)**\n\n"
            "Certifies your informal work experience into an official NSQF certificate:\n"
            "• **Eligibility**: 2+ years experience in any trade (no minimum education)\n"
            "• **Process**: 12-hour orientation + practical assessment by accredited assessor\n"
            "• **Result**: Government NSQF Certificate at Level 3 or 4\n"
            "• **Cost**: FREE — 100% funded under PMKVY 4.0\n"
            "• **Benefits**: Formal certification, loan eligibility, placement support\n\n"
            "You don't need to attend long courses. Your existing experience is your qualification!"
        ),
        "hi": (
            "**RPL (पूर्व शिक्षण की मान्यता)**\n\n"
            "आपके अनौपचारिक कार्य अनुभव को आधिकारिक NSQF प्रमाणपत्र में बदलता है:\n"
            "• **पात्रता**: किसी भी ट्रेड में 2+ वर्ष का अनुभव (न्यूनतम शिक्षा की आवश्यकता नहीं)\n"
            "• **प्रक्रिया**: 12-घंटे का ओरिएंटेशन + व्यावहारिक मूल्यांकन\n"
            "• **परिणाम**: स्तर 3 या 4 का सरकारी NSQF प्रमाणपत्र\n"
            "• **लागत**: निःशुल्क — PMKVY 4.0 के तहत 100% वित्त पोषित"
        ),
        "ta": (
            "**RPL (முந்தைய அனுபவ அங்கீகாரம்)**\n\n"
            "உங்கள் முறைசாரா வேலை அனுபவத்தை அரசு NSQF சான்றிதழாக மாற்றும்:\n"
            "• **தகுதி**: எந்த தொழிலிலும் 2+ வருட அனுபவம் (குறைந்தபட்ச கல்வி தேவையில்லை)\n"
            "• **செயல்முறை**: 12 மணி நேர நோக்குநிலை + நடைமுறை மதிப்பீடு\n"
            "• **முடிவு**: நிலை 3 அல்லது 4 அரசு NSQF சான்றிதழ்\n"
            "• **செலவு**: இலவசம் — PMKVY 4.0 கீழ் 100% நிதியளிக்கப்படுகிறது"
        ),
        "te": "**RPL** మీ అనుభవాన్ని అధికారిక NSQF సర్టిఫికెట్‌గా మారుస్తుంది. 2+ సంవత్సరాల అనుభవం అవసరం. PMKVY కింద 100% ఉచితం.",
        "kn": "**RPL** ನಿಮ್ಮ ಅನುಭವವನ್ನು ಅಧಿಕೃತ NSQF ಪ್ರಮಾಣಪತ್ರವಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ. 2+ ವರ್ಷದ ಅನುಭವ ಬೇಕು. PMKVY ಅಡಿ ಉಚಿತ.",
        "ml": "**RPL** നിങ്ങളുടെ അനുഭവം NSQF സർട്ടിഫിക്കറ്റ് ആക്കി മാറ്റുന്നു. 2+ വർഷം അനുഭവം വേണം. PMKVY-ൽ 100% സൗജന്യം.",
        "mr": "**RPL** आपल्या अनुभवाचे शासकीय NSQF प्रमाणपत्रात रूपांतर. 2+ वर्षांचा अनुभव लागतो. PMKVY अंतर्गत मोफत.",
        "bn": "**RPL** আপনার অভিজ্ঞতাকে সরকারি NSQF সার্টিফিকেটে রূপান্তর করে। 2+ বছরের অভিজ্ঞতা প্রয়োজন। PMKVY-তে ১০০% বিনামূল্যে।",
        "gu": "**RPL** તમારા અનુભવને સરકારી NSQF પ્રમાણપત્રમાં રૂપાંતરિત કરે છે. 2+ વર્ષ અનુભવ જરૂરી. PMKVY હેઠળ મફત.",
        "pa": "**RPL** ਤੁਹਾਡੇ ਤਜ਼ਰਬੇ ਨੂੰ ਸਰਕਾਰੀ NSQF ਸਰਟੀਫਿਕੇਟ ਵਿੱਚ ਬਦਲਦਾ ਹੈ। 2+ ਸਾਲ ਦਾ ਤਜ਼ਰਬਾ ਚਾਹੀਦਾ। PMKVY ਅਧੀਨ ਮੁਫ਼ਤ।",
        "or": "**RPL** ଆପଣଙ୍କ ଅଭିଜ୍ଞତାକୁ ସରକାରୀ NSQF ପ୍ରମାଣପତ୍ରରେ ପରିଣତ କରେ। PMKVY ଅଧୀନ ସଂପୂର୍ଣ ମାଗଣା।"
    },
    "schemes": {
        "en": (
            "**Government Schemes You Can Access:**\n\n"
            "1. **PMKVY 4.0** — 100% free skilling + stipend. 500+ job roles.\n"
            "2. **PM Vishwakarma** — ₹15,000 toolkit + ₹3 Lakh low-interest loan (5%) for artisans.\n"
            "3. **NAPS** — Apprenticeship with ₹1,500+/month government stipend.\n"
            "4. **MUDRA Yojana** — Business loans up to ₹10 Lakh for certified technicians.\n"
            "5. **DDU-GKY** — Free training + food + accommodation + placement for rural youth.\n\n"
            "Your eligibility is automatically computed based on your profile. Check 'Recommendations' for your personalized scheme list."
        ),
        "hi": (
            "**आपके लिए सरकारी योजनाएं:**\n\n"
            "1. **PMKVY 4.0** — 100% निःशुल्क प्रशिक्षण + वजीफा। 500+ व्यवसाय।\n"
            "2. **PM विश्वकर्मा** — ₹15,000 टूलकिट + ₹3 लाख कम ब्याज ऋण (5%) कारीगरों के लिए।\n"
            "3. **NAPS** — प्रशिक्षु ₹1,500+/माह सरकारी भत्ते के साथ।\n"
            "4. **मुद्रा योजना** — ₹10 लाख तक व्यवसाय ऋण।\n"
            "5. **DDU-GKY** — ग्रामीण युवाओं के लिए मुफ्त प्रशिक्षण + आवास + नियोजन।"
        ),
        "ta": (
            "**அரசு திட்டங்கள்:**\n\n"
            "1. **PMKVY 4.0** — 100% இலவச பயிற்சி + உதவித்தொகை\n"
            "2. **PM விஸ்வகர்மா** — ₹15,000 கருவித்தொகுப்பு + ₹3 லட்சம் 5% வட்டியில் கடன்\n"
            "3. **NAPS** — ₹1,500+/மாதம் சம்பளத்துடன் தொழில்பயிற்சி\n"
            "4. **முத்ரா கடன்** — ₹10 லட்சம் வரை வணிக கடன்\n"
            "5. **DDU-GKY** — கிராமப்புற இளைஞர்களுக்கு இலவச பயிற்சி + உணவு + வேலை"
        ),
        "te": "**ప్రభుత్వ పథకాలు:** 1) PMKVY 4.0 ఉచిత శిక్షణ, 2) PM విశ్వకర్మ ₹15,000 టూల్‌కిట్ + ₹3 లక్షల రుణం, 3) NAPS స్టైపెండ్, 4) ముద్రా లోన్ ₹10 లక్షలు, 5) DDU-GKY గ్రామీణ యువత శిక్షణ.",
        "kn": "**ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು:** 1) PMKVY 4.0 ಉಚಿತ ತರಬೇತಿ, 2) PM ವಿಶ್ವಕರ್ಮ ₹15,000 ಟೂಲ್‌ಕಿಟ್ + ₹3 ಲಕ್ಷ ಸಾಲ, 3) NAPS ವೇತನ, 4) ಮುದ್ರಾ ₹10 ಲಕ್ಷ, 5) DDU-GKY.",
        "ml": "**സർക്കാർ പദ്ധതികൾ:** 1) PMKVY 4.0 സൗജന്യ പരിശീലനം, 2) PM വിശ്വകർമ ₹15,000 ടൂൾകിറ്റ് + ₹3 ലക്ഷം വായ്പ, 3) NAPS സ്‌റ്റൈപ്പൻഡ്, 4) മുദ്ര ₹10 ലക്ഷം, 5) DDU-GKY.",
        "mr": "**सरकारी योजना:** 1) PMKVY 4.0 मोफत प्रशिक्षण, 2) PM विश्वकर्मा ₹15,000 टूलकिट + ₹3 लाख कर्ज, 3) NAPS, 4) मुद्रा ₹10 लाख, 5) DDU-GKY.",
        "bn": "**সরকারি প্রকল্পসমূহ:** 1) PMKVY 4.0 বিনামূল্যে প্রশিক্ষণ, 2) PM বিশ্বকর্মা ₹15,000 টুলকিট + ₹3 লাখ ঋণ, 3) NAPS, 4) মুদ্রা ₹10 লাখ, 5) DDU-GKY.",
        "gu": "**સરકારી યોજનાઓ:** 1) PMKVY 4.0 મફત, 2) PM વિશ્વકર્મા ₹15,000 + ₹3 લાખ, 3) NAPS, 4) ₹10 લાખ મુદ્રા, 5) DDU-GKY.",
        "pa": "**ਸਰਕਾਰੀ ਸਕੀਮਾਂ:** 1) PMKVY 4.0 ਮੁਫਤ, 2) PM ਵਿਸ਼ਵਕਰਮਾ ₹15,000 + ₹3 ਲੱਖ, 3) NAPS, 4) ₹10 ਲੱਖ ਮੁਦਰਾ, 5) DDU-GKY.",
        "or": "**ସରକାରୀ ଯୋଜନା:** 1) PMKVY 4.0 ମାଗଣା, 2) PM ବିଶ୍ୱକର୍ମା ₹15,000 + ₹3 ଲକ୍ଷ, 3) NAPS, 4) ₹10 ଲକ୍ଷ ମୁଦ୍ରା, 5) DDU-GKY."
    },
    "website_help": {
        "en": (
            "**How to Use SkillPath AI Platform:**\n\n"
            "1. 🎙️ **Voice Assessment** — Speak in your language to extract skills automatically.\n"
            "2. 👤 **My Profile** — View verified skills, gaps, and your NSQF target.\n"
            "3. 📚 **Recommendations** — AI-matched courses, schemes, training centres near you.\n"
            "4. 📈 **Skill Growth** — Track your 5-stage roadmap to certification.\n"
            "5. ⚙️ **Settings** — Change language (11 Indic languages), toggle Dark/Light mode.\n"
            "6. 🧮 **Loan Calculator** — Estimate MUDRA/PM Vishwakarma loan amounts.\n\n"
            "Ask me anything — I can help with NSQF levels, RPL, schemes, or platform navigation!"
        ),
        "hi": (
            "**SkillPath AI प्लेटफॉर्म का उपयोग कैसे करें:**\n\n"
            "1. 🎙️ **वॉइस असेसमेंट** — अपनी भाषा में बोलकर कौशल दर्ज करें।\n"
            "2. 👤 **माय प्रोफाइल** — सत्यापित कौशल और NSQF लक्ष्य देखें।\n"
            "3. 📚 **अनुशंसाएं** — AI द्वारा मिलान किए गए कोर्स और योजनाएं।\n"
            "4. 📈 **स्किल ग्रोथ** — प्रमाणीकरण तक 5-चरण रोडमैप।\n"
            "5. ⚙️ **सेटिंग्स** — भाषा बदलें, डार्क/लाइट थीम टॉगल करें।\n\n"
            "मुझसे NSQF, RPL, योजनाएं, या प्लेटफॉर्म के बारे में कुछ भी पूछें!"
        ),
        "ta": (
            "**SkillPath AI தளத்தை எவ்வாறு பயன்படுத்துவது:**\n\n"
            "1. 🎙️ **குரல் மதிப்பீடு** — உங்கள் மொழியில் பேசி திறன்களை பதிவு செய்யுங்கள்.\n"
            "2. 👤 **சுயவிவரம்** — சரிபார்க்கப்பட்ட திறன்கள் மற்றும் NSQF இலக்கு.\n"
            "3. 📚 **பரிந்துரைகள்** — AI பொருந்திய படிப்புகள் மற்றும் திட்டங்கள்.\n"
            "4. 📈 **திறன் வளர்ச்சி** — 5 நிலை சான்றிதழ் பெறும் வழிகாட்டி.\n"
            "5. ⚙️ **அமைப்புகள்** — மொழி மாற்றவும், டார்க்/லைட் தீம் தேர்வு செய்யவும்.\n\n"
            "NSQF, RPL, திட்டங்கள் அல்லது தளம் பற்றி என்னிடம் கேளுங்கள்!"
        ),
        "te": "**SkillPath AI ఉపయోగం:** 1) వాయిస్ మాట్లాడండి, 2) ప్రొఫైల్ చూడండి, 3) సిఫార్సులు పొందండి, 4) రోడ్‌మ్యాప్ ట్రాక్ చేయండి, 5) సెట్టింగ్స్‌లో భాష మార్చండి.",
        "kn": "**SkillPath AI ಬಳಕೆ:** 1) ವಾಯ್ಸ್ ಮೂಲಕ ಮಾತನಾಡಿ, 2) ಪ್ರೊಫೈಲ್ ನೋಡಿ, 3) ಶಿಫಾರಸುಗಳು, 4) ರೋಡ್‌ಮ್ಯಾಪ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, 5) ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಭಾಷೆ ಬದಲಿಸಿ.",
        "ml": "**SkillPath AI ഉപയോഗം:** 1) വോയ്‌സ് ഇൻപുട്ട്, 2) പ്രൊഫൈൽ, 3) ശുപാർശകൾ, 4) പ്രോഗ്രസ് ട്രാക്ക്, 5) ഭാഷ മാറ്റുക.",
        "mr": "**SkillPath AI वापर:** 1) व्हॉइसने बोला, 2) प्रोफाइल पहा, 3) शिफारशी, 4) रोडमॅप ट्रॅक करा, 5) भाषा बदला.",
        "bn": "**SkillPath AI ব্যবহার:** 1) ভয়েসে কথা বলুন, 2) প্রোফাইল দেখুন, 3) সুপারিশ, 4) রোডম্যাপ ট্র্যাক, 5) ভাষা পরিবর্তন।",
        "gu": "**SkillPath AI ઉપયોગ:** 1) વૉઇસ, 2) પ્રોફાઇલ, 3) ભલામણ, 4) રોડ-મ્યાપ, 5) ભાષા બદલો.",
        "pa": "**SkillPath AI ਵਰਤੋਂ:** 1) ਆਵਾਜ਼, 2) ਪ੍ਰੋਫਾਈਲ, 3) ਸਿਫਾਰਸ਼ਾਂ, 4) ਰੋਡਮੈਪ, 5) ਭਾਸ਼ਾ ਬਦਲੋ।",
        "or": "**SkillPath AI ବ୍ୟବହାର:** 1) ଭଏସ୍, 2) ପ୍ରୋଫାଇଲ୍, 3) ସୁପାରିଶ, 4) ରୋଡ୍‌ମ୍ୟାପ୍, 5) ଭାଷା ପରିବର୍ତ୍ତନ।"
    }
}


def _build_system_prompt(language: str, context: Dict[str, Any]) -> str:
    """Build a comprehensive, rich system prompt for Gemini."""
    lang_name = LANGUAGE_NAMES.get(language, "English")

    # Serialize knowledge base sections
    nsqf_kb = KNOWLEDGE_BASE["nsqf_levels"]["summary"]
    rpl_kb = KNOWLEDGE_BASE["rpl"]["summary"]
    schemes_kb = "\n".join(
        f"  - {name}: {desc}"
        for name, desc in KNOWLEDGE_BASE["schemes"].items()
    )
    website_kb = "\n".join(
        f"  - {feat}: {desc}"
        for feat, desc in KNOWLEDGE_BASE["website_features"].items()
    )
    qp_examples = "\n".join(
        f"  - {code}: {desc}"
        for code, desc in KNOWLEDGE_BASE["nsqf_qp_examples"].items()
    )

    # User context section
    ctx_lines = []
    if context.get("user_name"):
        ctx_lines.append(f"User Name: {context['user_name']}")
    if context.get("education"):
        ctx_lines.append(f"Education: {context['education']}")
    if context.get("prior_occupation"):
        ctx_lines.append(f"Prior Occupation: {context['prior_occupation']}")
    if context.get("experience_years"):
        ctx_lines.append(f"Experience: {context['experience_years']} years")
    if context.get("target_pathway"):
        tp = context["target_pathway"]
        ctx_lines.append(
            f"Target NSQF Pathway: {tp.get('title', 'N/A')} "
            f"({tp.get('nsqfLevel', '')} - QP Code: {tp.get('qpCode', '')})"
        )
    if context.get("goal"):
        ctx_lines.append(f"Livelihood Goal: {context['goal']}")
    if context.get("location"):
        ctx_lines.append(f"Location: {context['location']}")
    if context.get("missing_competencies"):
        mc = context["missing_competencies"]
        if isinstance(mc, list) and mc:
            gaps = ", ".join(str(c.get("name", c)) for c in mc[:5])
            ctx_lines.append(f"Current Skill Gaps: {gaps}")

    user_context_section = "\n".join(ctx_lines) if ctx_lines else "Not yet available."

    return f"""You are **SkillBot** — the official, intelligent AI Counselor for **SkillPath AI (LivelihoodAI)**, India's voice-first NSQF livelihood enablement platform.

CRITICAL INSTRUCTION: You MUST respond ONLY in **{lang_name}**. Write naturally and fluently in {lang_name}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 YOUR DEEP KNOWLEDGE BASE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━

**1. NSQF Framework:**
{nsqf_kb}

**2. RPL (Recognition of Prior Learning):**
{rpl_kb}

**3. Government Schemes:**
{schemes_kb}

**4. Platform Features (SkillPath AI Website):**
{website_kb}

**5. Sample Qualification Packs (QP Codes):**
{qp_examples}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER CONTEXT (use to personalize answers):
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{user_context_section}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RESPONSE GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Always respond in **{lang_name}** — no exceptions.
• Be concise but thorough (150–400 words max per response).
• Use bullet points and clear structure.
• Tone: Warm, supportive, encouraging, and actionable.
• When answering about schemes: mention eligibility, benefits, and how to apply.
• When answering about the website: give step-by-step navigation instructions.
• When the user mentions their trade/skill, recommend the specific NSQF QP that fits.
• If unsure of something specific, acknowledge it and guide the user to official sources.
• Never make up specific government data or numbers that you're unsure about.
• You CAN answer general knowledge questions about India's skilling ecosystem.
"""


def call_gemini_counselor(
    query: str,
    language: str,
    context: Dict[str, Any],
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Optional[str]:
    """
    Call Google Gemini 2.0 Flash with comprehensive domain knowledge and conversation history.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key or api_key.startswith("your_") or api_key == "insecure_dev_key":
        return None

    system_prompt = _build_system_prompt(language, context)

    # Build multi-turn conversation contents
    contents = []

    # Add conversation history (up to last 6 turns to stay within token limits)
    if conversation_history:
        for turn in conversation_history[-6:]:
            role = turn.get("role", "user")
            text = turn.get("text", "")
            if role in ("user", "model") and text:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })

    # Add the current user message with system prompt prepended on first message
    if not contents:
        # First message — prepend system prompt
        contents.append({
            "role": "user",
            "parts": [{"text": f"{system_prompt}\n\n---\nUser Question: {query}"}]
        })
    else:
        # Subsequent messages in conversation
        contents.append({
            "role": "user",
            "parts": [{"text": query}]
        })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1200,
            "topP": 0.9,
            "topK": 40
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"}
        ]
    }

    # Try Gemini 2.0 Flash first, fall back to 1.5 Flash
    models_to_try = [
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]

    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text = parts[0].get("text", "").strip()
                        if text:
                            logger.info(f"Counselor responded via {model}")
                            return text
        except urllib.error.HTTPError as e:
            if e.code == 404:
                logger.warning(f"Model {model} not found, trying next...")
                continue
            logger.warning(f"Gemini counselor HTTP error ({model}): {e.code} — {e.read().decode('utf-8', errors='ignore')[:200]}")
        except Exception as e:
            logger.warning(f"Gemini counselor call error ({model}): {e}")

    return None


def _detect_topic(q_lower: str) -> str:
    """Detect the primary topic from the query for fallback routing."""
    nsqf_kws = [
        "nsqf", "level", "standard", "nos", "qp", "qualification pack",
        "स्तर", "தரம்", "நிலை", "స్థాయి", "ಮಟ್ಟ", "ലെവൽ", "स्तर"
    ]
    rpl_kws = [
        "rpl", "prior learning", "experience certif", "certificate", "informal",
        "சான்றிதழ்", "प्रमाणपत्र", "అనుభవం", "ಅನುಭವ", "അനുഭവം"
    ]
    scheme_kws = [
        "scheme", "pmkvy", "vishwakarma", "loan", "subsidy", "stipend",
        "mudra", "naps", "ddugky", "money", "fund", "grant", "yojana",
        "திட்டம்", "योजना", "ऋण", "రుణం", "ಸಾಲ", "വായ്പ"
    ]
    website_kws = [
        "how to", "website", "feature", "voice", "profile", "theme", "dark",
        "light", "setting", "platform", "navigate", "use", "login", "register",
        "பயன்படுத்துவது", "वेबसाइट", "ఉపయోగం", "ಬಳಕೆ", "ഉപയോഗം"
    ]

    if any(k in q_lower for k in nsqf_kws):
        return "nsqf"
    if any(k in q_lower for k in rpl_kws):
        return "rpl"
    if any(k in q_lower for k in scheme_kws):
        return "schemes"
    if any(k in q_lower for k in website_kws):
        return "website_help"
    return "website_help"  # default to help


def get_intelligent_counselor_response(
    query: str,
    language: str = "en",
    context: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Intelligent Multilingual AI Counselor Router:
    1. Attempts Gemini 2.0 Flash with full domain knowledge + conversation history.
    2. Falls back to semantic domain RAG engine in the chosen vernacular language.
    """
    context = context or {}
    conversation_history = conversation_history or []
    q_clean = query.strip().lower()

    # 1. Attempt Gemini Generation
    gemini_reply = call_gemini_counselor(query, language, context, conversation_history)
    if gemini_reply:
        return {
            "success": True,
            "answer": gemini_reply,
            "language": language,
            "engine": "gemini-2.0-flash",
            "topic": "ai_counselor"
        }

    # 2. Semantic Fallback Matching
    topic = _detect_topic(q_clean)

    topic_dict = VERNACULAR_RESPONSES.get(topic, VERNACULAR_RESPONSES["website_help"])
    vernacular_text = topic_dict.get(language, topic_dict["en"])

    # Personalize if context is available
    if context.get("target_pathway"):
        tp = context["target_pathway"]
        pathway_line = (
            f"\n\n👉 {'உங்கள் பரிந்துரைக்கப்பட்ட தொழில் பாதை' if language == 'ta' else 'आपका अनुशंसित करियर मार्ग' if language == 'hi' else 'Your recommended pathway'}: "
            f"{tp.get('title', 'NSQF Qualification')} "
            f"({tp.get('nsqfLevel', 'NSQF')} - {tp.get('qpCode', '')})."
        )
        vernacular_text += pathway_line

    return {
        "success": True,
        "answer": vernacular_text,
        "language": language,
        "engine": "vernacular-rag-fallback",
        "topic": topic
    }
