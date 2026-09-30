import re
import uuid
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.voice import VoiceQuestion, VoiceSessionSubmission, VoiceSessionResult, VoiceSessionAnswer

CONVERSATIONAL_QUESTIONS: List[VoiceQuestion] = [
    VoiceQuestion(
        id=1,
        key="education",
        question_en="What is your highest level of education?",
        question_ta="உங்கள் கல்வித் தகுதி என்ன?",
        question_hi="आपकी उच्चतम शैक्षणिक योग्यता क्या है?",
        placeholder_en="E.g., I completed 10th standard / 12th standard / Diploma in Mechanical...",
        placeholder_ta="எ.கா., நான் 12-ம் வகுப்பு வரை படித்துள்ளேன்...",
        placeholder_hi="उदा: मैंने 10वीं / 12वीं / डिप्लोमा पूरा किया है...",
        sample_answer_en="I completed 12th standard in Higher Secondary School.",
        sample_answer_ta="நான் 12-ம் வகுப்பு வரை படித்துள்ளேன்.",
        sample_answer_hi="मैंने 12वीं कक्षा उच्चतर माध्यमिक विद्यालय से पूरी की है।"
    ),
    VoiceQuestion(
        id=2,
        key="skills",
        question_en="What skills do you currently have?",
        question_ta="உங்களிடம் தற்போது என்னென்ன திறன்கள் உள்ளன?",
        question_hi="वर्तमान में आपके पास कौन-से कौशल (हुनर) हैं?",
        placeholder_en="E.g., Basic garment stitching, hand embroidery, digital UPI payments...",
        placeholder_ta="எ.கா., தையல் வேலை, எம்பிராய்டரி, மொபைல் பணம் செலுத்துதல்...",
        placeholder_hi="उदा: सिलाई कार्य, कपड़ा कटाई, यूपीआई भुगतान...",
        sample_answer_en="I know basic stitching, cutting fabric, and taking garment measurements.",
        sample_answer_ta="எனக்கு துணி வெட்டுதல் மற்றும் அடிப்படை தையல் வேலை தெரியும்.",
        sample_answer_hi="मुझे बेसिक मशीन सिलाई, कपड़े की कटाई और नाप लेना आता है।"
    ),
    VoiceQuestion(
        id=3,
        key="work_done_before",
        question_en="What type of work have you done before?",
        question_ta="இதற்கு முன்பு நீங்கள் என்ன மாதிரியான வேலை செய்துள்ளீர்கள்?",
        question_hi="आपने पहले किस प्रकार का कार्य किया है?",
        placeholder_en="E.g., Assistant in a local tailoring shop, domestic repair helper...",
        placeholder_ta="எ.கா., உள்ளூர் தையல் கடையில் உதவியாளராக வேலை செய்தேன்...",
        placeholder_hi="उदा: सिलाई की दुकान में सहायक, इलेक्ट्रीशियन हेल्पर...",
        sample_answer_en="I worked in a neighborhood tailoring boutique assisting with blouse stitching.",
        sample_answer_ta="நான் அருகில் உள்ள தையல் கடையில் உதவியாளராக பணிபுரிந்தேன்.",
        sample_answer_hi="मैंने स्थानीय सिलाई की दुकान में ब्लाउज़ और कुर्ती सिलाई में सहायता की है।"
    ),
    VoiceQuestion(
        id=4,
        key="experience_duration",
        question_en="How much work experience do you have?",
        question_ta="உங்களுக்கு எவ்வளவு கால பணி அனுபவம் உள்ளது?",
        question_hi="आपके पास कितना कार्य अनुभव है?",
        placeholder_en="E.g., 2 years, 6 months, fresh beginner...",
        placeholder_ta="எ.கா., 2 ஆண்டுகள் அனுபவம் உள்ளது...",
        placeholder_hi="उदा: 2 साल, 1 वर्ष, 6 महीने...",
        sample_answer_en="I have about two years of practical hands-on experience.",
        sample_answer_ta="எனக்கு இரண்டு வருட நடைமுறை அனுபவம் உள்ளது.",
        sample_answer_hi="मेरे पास लगभग 2 वर्ष का व्यावहारिक अनुभव है।"
    ),
    VoiceQuestion(
        id=5,
        key="interests",
        question_en="What type of work are you interested in?",
        question_ta="உங்களுக்கு எந்த வகையான வேலையில் ஆர்வம் உள்ளது?",
        question_hi="आप किस प्रकार के कार्य में रुचि रखते हैं?",
        placeholder_en="E.g., Women's designer wear, bridal tailoring, boutique business...",
        placeholder_ta="எ.கா., நவீன ஆடை வடிவமைப்பு, பூட்டிக் கடை தொடங்குதல்...",
        placeholder_hi="उदा: डिज़ाइनर वस्त्र, बुटीक सिलाई...",
        sample_answer_en="I am passionate about designer blouses, kurtis, and running my own tailoring setup.",
        sample_answer_ta="நவீன ஆடை வடிவமைப்பு மற்றும் சொந்த தையல் தொழில் செய்வதில் ஆர்வம் உள்ளது.",
        sample_answer_hi="मेरी रुचि बुटीक डिज़ाइनर ब्लाउज़, कुर्तियां और घरेलू व्यवसाय में है।"
    ),
    VoiceQuestion(
        id=6,
        key="livelihood_goal",
        question_en="What is your preferred livelihood goal?",
        question_ta="உங்கள் வாழ்வாதார இலக்கு என்ன?",
        question_hi="आपका पसंदीदा आजीविका लक्ष्य क्या है?",
        placeholder_en="E.g., Home-based self employment, wage job in garment factory...",
        placeholder_ta="எ.கா., வீட்டிலிருந்தே சொந்த தொழில் அல்லது நிறுவன வேலை...",
        placeholder_hi="उदा: घर से स्वरोज़गार, कंपनी में नौकरी...",
        sample_answer_en="I want to run a home-based self-employment business so I can earn steadily.",
        sample_answer_ta="வீட்டிலிருந்தே சுயதொழில் செய்து வருமானம் ஈட்ட விரும்புகிறேன்.",
        sample_answer_hi="मैं घर से स्वरोज़गार चलाकर एक स्थिर आय कमाना चाहती हूँ।"
    ),
    VoiceQuestion(
        id=7,
        key="resources",
        question_en="What resources or tools do you currently have?",
        question_ta="உங்களிடம் என்னென்ன கருவிகள் அல்லது வளங்கள் உள்ளன?",
        question_hi="वर्तमान में आपके पास क्या उपकरण या संसाधन उपलब्ध हैं?",
        placeholder_en="E.g., Manual sewing machine, scissor kit, smartphone with UPI...",
        placeholder_ta="எ.கா., தையல் இயந்திரம், ஸ்மார்ட்போன், கத்தரிக்கோல்...",
        placeholder_hi="उदा: सिलाई मशीन, स्मार्टफोन, औज़ार किट...",
        sample_answer_en="I have a manual sewing machine, measuring tape, and a smartphone with UPI.",
        sample_answer_ta="என்னிடம் கை தையல் இயந்திரம் மற்றும் ஸ்மார்ட்போன் உள்ளது.",
        sample_answer_hi="मेरे पास एक हाथ वाली सिलाई मशीन, नापने का टेप और यूपीआई युक्त स्मार्टफोन है।"
    ),
    VoiceQuestion(
        id=8,
        key="employment_preference",
        question_en="What type of employment do you prefer?",
        question_ta="எங்கு அல்லது எவ்வாறு பணிபுரிய விரும்புகிறீர்கள்?",
        question_hi="आप किस प्रकार के रोज़गार को प्राथमिकता देते हैं?",
        placeholder_en="E.g., Working from home, local workshop, full-time company...",
        placeholder_ta="எ.கா., வீட்டிலிருந்து வேலை, அருகிலுள்ள பணிமனை...",
        placeholder_hi="उदा: घर से कार्य, स्थानीय वर्कशॉप, दिन की पाली...",
        sample_answer_en="I prefer working from home with flexible daytime hours.",
        sample_answer_ta="வீட்டிலிருந்தே நெகிழ்வான நேரத்தில் வேலை செய்ய விரும்புகிறேன்.",
        sample_answer_hi="मैं दिन के समय घर से लचीले घंटों में कार्य करना पसंद करती हूँ।"
    ),
    VoiceQuestion(
        id=9,
        key="constraints",
        question_en="Are there any constraints that affect the type of work you can do?",
        question_ta="நீங்கள் வேலை செய்வதில் ஏதேனும் வரம்புகள் அல்லது தடைகள் உள்ளதா?",
        question_hi="क्या कोई ऐसी सीमाएं या बाधाएं हैं जो आपके कार्य को प्रभावित करती हैं?",
        placeholder_en="E.g., Cannot travel far, can only work afternoon shifts...",
        placeholder_ta="எ.கா., நீண்ட தூரம் பயணிக்க முடியாது, பிற்பகல் நேரம் மட்டுமே இயலும்...",
        placeholder_hi="उदा: दूर यात्रा नहीं कर सकते, पारिवारिक जिम्मेदारियां...",
        sample_answer_en="I have family responsibilities, so I cannot travel more than 5 kilometers.",
        sample_answer_ta="குடும்ப சூழ்நிலை காரணமாக அதிக தூரம் பயணிக்க இயலாது.",
        sample_answer_hi="मेरी पारिवारिक जिम्मेदारियां हैं, इसलिए मैं 5 किलोमीटर से अधिक दूर नहीं जा सकती।"
    ),
]


def get_conversational_questions() -> List[VoiceQuestion]:
    """Retrieve all 9 standard SIH voice assessment questions."""
    return CONVERSATIONAL_QUESTIONS


def clean_voice_text(text: str) -> str:
    """Normalize transcribed natural voice input across all Indian languages."""
    if not text:
        return ""
    # Strip unnecessary whitespaces and normalize punctuation
    cleaned = re.sub(r'\s+', ' ', text).strip()
    return cleaned


from app.ai.profile_extraction.extractor import extract_structured_profile
from app.ai.skill_extraction.skill_normalizer import extract_and_normalize_skills
from app.ai.recommendation.recommendation_engine import rank_livelihood_recommendations


def generate_vernacular_guidance(
    lang: str,
    role_name: str,
    nsqf_level: str,
    match_score: float,
    prior_occupation: str,
    matched_skills: List[str],
    missing_skills: List[str],
    livelihood_goal: str,
    resources: List[str]
) -> Tuple[str, str, List[Dict[str, Any]]]:
    """
    Generates personalized livelihood guidance, suitability analysis, and actionable
    skill development roadmaps in the candidate's selected Indian language.
    """
    clean_lang = (lang or "en").lower().split("-")[0]
    matched_skills_str = ", ".join(matched_skills[:3]) if matched_skills else ("Practical Experience" if clean_lang == "en" else "நடைமுறை அனுபவம்" if clean_lang == "ta" else "व्यावहारिक अनुभव")
    missing_skills_str = ", ".join(missing_skills[:3]) if missing_skills else ("Advanced Standards & Safety" if clean_lang == "en" else "மேம்பட்ட தரம் & பாதுகாப்பு" if clean_lang == "ta" else "उन्नत मानक व सुरक्षा")
    occ_str = prior_occupation if prior_occupation and prior_occupation.lower() != "unknown" else ("practical work" if clean_lang == "en" else "முந்தைய பணி" if clean_lang == "ta" else "पिछला कार्य")

    if clean_lang == "ta":
        suitability = (
            f"உங்கள் குரல் வழி பதிவுகளின் அடிப்படையில் உங்களுக்கு மிகவும் பொருத்தமான தொழில் பாதை: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% பொருத்தம்). உங்கள் {occ_str} அனுபவமும், நீங்கள் கூறிய "
            f"'{matched_skills_str}' திறன்களும் இந்த தொழில் வாய்ப்பிற்கு மிகச் சிறந்த அடித்தளமாகும்."
        )
        dev_summary = (
            f"உங்கள் திறன்களை முழுமையாக்கி வாழ்வாதாரத்தை உயர்த்த 4 எளிய வழிகள்: "
            f"1) RPL மூலம் உங்கள் முந்தைய அனுபவத்திற்கு அரசு NSQF சான்றிதழ் பெறுதல். "
            f"2) '{missing_skills_str}' ஆகிய விடுபட்ட திறன்களைக் குறுகிய கால பிரிட்ஜ் பயிற்சி மூலம் கற்றல். "
            f"3) PMKVY / PM விஸ்வகர்மா மூலம் இலவச கருவித்தொகுப்பு மற்றும் நிதியுதவி பெறுதல். "
            f"4) உள்ளூர் வேலைவாய்ப்பு அல்லது சொந்த தொழில் மூலம் மாத வருமானத்தை 50% வரை உயர்த்துதல்."
        )
        roadmap = [
            {
                "step": 1,
                "title": "முந்தைய கற்றல் அங்கீகாரம் (RPL)",
                "badge": "12 மணிநேர பயிற்சி",
                "description": f"உங்கள் {occ_str} பணி அனுபவத்தை மத்திய அரசின் அங்கீகரிக்கப்பட்ட NSQF சான்றிதழாக இலவசமாக மாற்றுங்கள்.",
                "action": "PMKVY RPL மையத்தில் பதிவு செய்க"
            },
            {
                "step": 2,
                "title": "விடுபட்ட திறன்களை வளர்த்தல் (Bridge Skills)",
                "badge": f"{len(missing_skills[:3])} முக்கிய திறன்கள்",
                "description": f"முழுத் தகுதி பெற '{missing_skills_str}' ஆகிய திறன்களுக்கான குறுகிய கால செயல்முறைப் பயிற்சியை முடியுங்கள்.",
                "action": "பிரிட்ஜ் வகுப்புகளைப் பாருங்கள்"
            },
            {
                "step": 3,
                "title": "தொழில்நுட்ப கருவிகள் மற்றும் அரசு மானியம்",
                "badge": "இலவச கருவித்தொகுப்பு",
                "description": "PM விஸ்வகர்மா அல்லது அரசு திட்டத்தின் மூலம் தொழில் செய்வதற்கான உபகரணங்கள் மற்றும் ₹15,000 மதிப்பிலான கருவித்தொகுப்பு பெறுங்கள்.",
                "action": "திட்டப் பலன்களைப் பெறுங்கள்"
            },
            {
                "step": 4,
                "title": "வருமான வாய்ப்பு & தொழில் வளர்ச்சி",
                "badge": "சான்றளிக்கப்பட்ட தொழில்முனைவோர்",
                "description": f"{role_name} பிரிவில் நேரடி நிறுவன வேலைவாய்ப்பு அல்லது முத்ரா கடன் மூலம் சொந்த தொழில் தொடங்கி வருமானத்தை பெருக்குங்கள்.",
                "action": "வாய்ப்புகளை ஆராயுங்கள்"
            }
        ]

    elif clean_lang == "hi":
        suitability = (
            f"आपके वॉयस मूल्यांकन के अनुसार आपके लिए सबसे उपयुक्त आजीविका: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% मैच)। आपका {occ_str} का कार्य अनुभव और "
            f"'{matched_skills_str}' कौशल इस पद के लिए अत्यधिक सुदृढ़ आधार हैं।"
        )
        dev_summary = (
            f"अपने कौशल को विकसित करने और आय बढ़ाने के 4 कदम: "
            f"1) RPL द्वारा मौजूदा अनुभव के लिए निःशुल्क सरकारी NSQF प्रमाणपत्र प्राप्त करें। "
            f"2) '{missing_skills_str}' के लिए ब्रिज ट्रेनिंग पूरी करें। "
            f"3) पीएम विश्वकर्मा या PMKVY के अंतर्गत निःशुल्क आधुनिक टूलकिट प्राप्त करें। "
            f"4) प्रमाणित कौशल के साथ अपनी मासिक आय 40-60% तक बढ़ाएं।"
        )
        roadmap = [
            {
                "step": 1,
                "title": "पूर्व अनुभव की मान्यता (RPL)",
                "badge": "12-घंटे का ओरिएंटेशन",
                "description": f"अपने {occ_str} के अनौपचारिक अनुभव को सीधे भारत सरकार के आधिकारिक NSQF प्रमाणपत्र में बदलें।",
                "action": "RPL मूल्यांकन के लिए आवेदन करें"
            },
            {
                "step": 2,
                "title": "नए कौशल का प्रशिक्षण (Bridge Training)",
                "badge": f"{len(missing_skills[:3])} आवश्यक कौशल",
                "description": f"100% कार्यकुशलता के लिए '{missing_skills_str}' पर केंद्रित व्यावहारिक प्रशिक्षण लें।",
                "action": "ब्रिज कोर्स देखें"
            },
            {
                "step": 3,
                "title": "आधुनिक टूलकिट और सरकारी सहायता",
                "badge": "मुफ़्त टूलकिट",
                "description": "पीएम विश्वकर्मा या सरकारी योजना के तहत उन्नत उपकरण और ₹15,000 की टूलकिट प्रोत्साहन राशि प्राप्त करें।",
                "action": "योजना लाभ देखें"
            },
            {
                "step": 4,
                "title": "रोज़गार व स्वरोज़गार स्थापना",
                "badge": "प्रमाणित कुशल कर्मी",
                "description": f"{role_name} के रूप में सीधे प्लेसमेंट या मुद्रा ऋण के साथ अपना स्वरोज़गार स्थापित करें।",
                "action": "अवसर देखें"
            }
        ]

    elif clean_lang == "te":
        suitability = (
            f"మీ వాయిస్ సమాధానాల ఆధారంగా మీకు అత్యంత అనువైన ఉపాధి మార్గం: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% సరిపోలిక). మీ {occ_str} అనుభవం మరియు "
            f"'{matched_skills_str}' నైపుణ్యాలు దీనికి చక్కటి పునాది."
        )
        dev_summary = (
            f"మీ నైపుణ్యాలను అభివృద్ధి చేసుకునే విధానం: "
            f"1) RPL ద్వారా ప్రభుత్వం ఇచ్చే ఉచిత అధికారిక NSQF సర్టిఫికేట్ పొందండి. "
            f"2) '{missing_skills_str}' నైపుణ్యాల కోసం బ్రిడ్జ్ కోర్సు పూర్తి చేయండి. "
            f"3) పీఎం విశ్వకర్మ లేదా PMKVY ద్వారా ఉచిత టూల్‌కిట్ మరియు ఉపాధి సహాయం పొందండి."
        )
        roadmap = [
            {
                "step": 1,
                "title": "ముందస్తు నైపుణ్య గుర్తింపు (RPL)",
                "badge": "12 గంటల ఓరియంటేషన్",
                "description": f"మీ {occ_str} అనుభవానికి కేంద్ర ప్రభుత్వ అధికారిక NSQF సర్టిఫికేషన్ పొందండి.",
                "action": "RPL రిజిస్ట్రేషన్"
            },
            {
                "step": 2,
                "title": "కొత్త నైపుణ్యాల సాధన (Bridge Training)",
                "badge": "నైపుణ్యాల వృద్ధి",
                "description": f"పూర్తి ప్రావీణ్యం కోసం '{missing_skills_str}' అంశాలపై ప్రాక్టికల్ శిక్షణ పొందండి.",
                "action": "కోర్సులు చూడండి"
            },
            {
                "step": 3,
                "title": "ఉచిత టూల్‌కిట్ & ప్రభుత్వ పథకాలు",
                "badge": "పరికరాల కిట్",
                "description": "పీఎం విశ్వకర్మ ద్వారా ఆధునిక పనిముట్లు మరియు ఆర్థిక సహాయం అందుకోండి.",
                "action": "పథకం వివరాలు"
            },
            {
                "step": 4,
                "title": "ఉపాధి లేదా స్వయం ఉపాధి",
                "badge": "సర్టిఫైడ్ ప్రొఫెషనల్",
                "description": f"{role_name} గా స్థానిక పరిశ్రమలో ఉద్యోగం లేదా ముద్ర రుణం ద్వారా స్వంత వ్యాపారం ప్రారంభించండి.",
                "action": "ఉపాధి అవకాశాలు"
            }
        ]

    elif clean_lang == "kn":
        suitability = (
            f"ನಿಮ್ಮ ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನದ ಪ್ರಕಾರ ನಿಮಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ವೃತ್ತಿ ಮಾರ್ಗ: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% ಹೊಂದಾಣಿಕೆ). ನಿಮ್ಮ {occ_str} ಅನುಭವ ಮತ್ತು "
            f"'{matched_skills_str}' ಕೌಶಲ್ಯಗಳು ಇದಕ್ಕೆ ಪೂರಕವಾಗಿವೆ."
        )
        dev_summary = (
            f"ಕೌಶಲ್ಯಗಳನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಲು 4 ಹಂತಗಳು: "
            f"1) RPL ಅಡಿಯಲ್ಲಿ ಉಚಿತ ಅಧಿಕೃತ NSQF ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯಿರಿ. "
            f"2) '{missing_skills_str}' ಕೌಶಲ್ಯಗಳಿಗಾಗಿ ಬ್ರಿಡ್ಜ್ ತರಬೇತಿ ಪೂರ್ಣಗೊಳಿಸಿ. "
            f"3) ಪಿಎಂ ವಿಶ್ವಕರ್ಮ ಅಥವಾ PMKVY ಮೂಲಕ ಉಚಿತ ಸಲಕರಣೆ ಕಿಟ್ ಮತ್ತು ಉದ್ಯೋಗ ಬೆಂಬಲ ಪಡೆಯಿರಿ."
        )
        roadmap = [
            {
                "step": 1,
                "title": "ಪೂರ್ವ ಅನುಭವದ ಮಾನ್ಯತೆ (RPL)",
                "badge": "12 ಗಂಟೆಗಳ ಓರಿಯಂಟೇಶನ್",
                "description": f"ನಿಮ್ಮ {occ_str} ಅನುಭವಕ್ಕೆ ಸರಕಾರದಿಂದ ಅಧಿಕೃತ NSQF ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯಿರಿ.",
                "action": "RPL ನೋಂದಣಿ"
            },
            {
                "step": 2,
                "title": "ಬ್ರಿಡ್ಜ್ ಕೌಶಲ್ಯ ತರಬೇತಿ",
                "badge": "ಪ್ರಮುಖ ಕೌಶಲ್ಯಗಳು",
                "description": f"ಸಂಪೂರ್ಣ ಪರಿಣತಿಗಾಗಿ '{missing_skills_str}' ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಿರಿ.",
                "action": "ತರಬೇತಿ ವಿವರ"
            },
            {
                "step": 3,
                "title": "ಉಚಿತ ಟೂಲ್ಕಿಟ್ ಮತ್ತು ಪ್ರೋತ್ಸಾಹಧನ",
                "badge": "ಟೂಲ್ಕಿಟ್ ಬೆಂಬಲ",
                "description": "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮೂಲಕ ಆಧುನಿಕ ಸಲಕರಣೆಗಳು ಮತ್ತು ಸಹಾಯಧನ ಪಡೆಯಿರಿ.",
                "action": "ಯೋಜನೆ ಮಾಹಿತಿ"
            },
            {
                "step": 4,
                "title": "ಉದ್ಯೋಗಾವಕಾಶ ಮತ್ತು ಸ್ವಯಂ ಉದ್ಯಮ",
                "badge": "ಪ್ರಮಾಣೀಕೃತ ವೃತ್ತಿಪರ",
                "description": f"{role_name} ಆಗಿ ಉತ್ತಮ ಸಂಬಳದ ಉದ್ಯೋಗ ಅಥವಾ ಮುದ್ರಾ ಸಾಲದೊಂದಿಗೆ ಸ್ವಂತ ಉದ್ಯಮ ನಡೆಸಿ.",
                "action": "ಅವಕಾಶಗಳನ್ನು ನೋಡಿ"
            }
        ]

    elif clean_lang == "ml":
        suitability = (
            f"നിങ്ങളുടെ വോയ്‌സ് വിലയിരുത്തൽ അനുസരിച്ച് നിങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമായ തൊഴിൽ: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% പൊരുത്തം). നിങ്ങളുടെ {occ_str} പ്രവൃത്തിപരിചയവും "
            f"'{matched_skills_str}' നൈപുണ്യങ്ങളും ഇതിന് ഉത്തമ അടിത്തറയാണ്."
        )
        dev_summary = (
            f"കഴിവുകൾ വികസിപ്പിക്കാനും വരുമാനം വർദ്ധിപ്പിക്കാനുമുള്ള വഴികൾ: "
            f"1) RPL വഴി സൗജന്യ സർക്കാർ NSQF സർട്ടിഫിക്കറ്റ് നേടുക. "
            f"2) '{missing_skills_str}' എന്നതിനായി ബ്രിഡ്ജ് പരിശീലനം പൂർത്തിയാക്കുക. "
            f"3) PMKVY / പിഎം വിശ്വകർമ വഴി സൗജന്യ ടൂൾകിറ്റും ഉപജീവന സഹായവും നേടുക."
        )
        roadmap = [
            { "step": 1, "title": "മുൻപരിചയ അംഗീകാരം (RPL)", "badge": "12 മണിക്കൂർ ഓറിയന്റേഷൻ", "description": "നിങ്ങളുടെ പ്രവൃത്തിപരിചയത്തിന് സർക്കാർ സർട്ടിഫിക്കറ്റ് നേടുക.", "action": "രജിസ്റ്റർ ചെയ്യുക" },
            { "step": 2, "title": "ബ്രിഡ്ജ് പരിശീലനം", "badge": "അധിക കഴിവുകൾ", "description": f"'{missing_skills_str}' എന്നിവയിൽ വിദഗ്ദ്ധ പരിശീലനം നേടുക.", "action": "കോഴ്സുകൾ കാണുക" },
            { "step": 3, "title": "സൗജന്യ ടൂൾകിറ്റും പദ്ധതി ആനുകൂല്യങ്ങളും", "badge": "ടൂൾകിറ്റ്", "description": "സർക്കാർ പദ്ധതികളിലൂടെ ആധുനിക ഉപകരണങ്ങൾ കരസ്ഥമാക്കുക.", "action": "പദ്ധതി കാണുക" },
            { "step": 4, "title": "തൊഴിലും സ്ഥിരവരുമാനവും", "badge": "പ്രൊഫഷണൽ", "description": f"{role_name} ആയി മികച്ച തൊഴിൽ നേടുക.", "action": "അവസരങ്ങൾ കാണുക" }
        ]

    elif clean_lang == "mr":
        suitability = (
            f"तुमच्या व्हॉइस मूल्यांकनानुसार तुमच्यासाठी सर्वात योग्य आजीविका: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% जुळणी). तुमचा {occ_str} अनुभव आणि "
            f"'{matched_skills_str}' कौशल्ये यासाठी अत्यंत मजबूत पाया आहेत."
        )
        dev_summary = (
            f"कौशल्यांचा विकास करण्यासाठी 4 टप्पे: "
            f"1) RPL द्वारे मोफत शासकीय NSQF प्रमाणपत्र मिळवा. "
            f"2) '{missing_skills_str}' साठी ब्रिज प्रशिक्षण पूर्ण करा. "
            f"3) पीएम विश्वकर्मा अंतर्गत आधुनिक टूलकिट आणि आर्थिक साहाय्य मिळवा."
        )
        roadmap = [
            { "step": 1, "title": "पूर्वीच्या अनुभवाची मान्यता (RPL)", "badge": "१२ तास अभिमुखता", "description": "तुमच्या अनौपचारिक अनुभवाला शासकीय प्रमाणपत्रात बदला.", "action": "RPL साठी नोंदणी करा" },
            { "step": 2, "title": "ब्रिज कौशल्य प्रशिक्षण", "badge": "आवश्यक कौशल्ये", "description": f"'{missing_skills_str}' चे व्यावहारिक प्रशिक्षण घ्या.", "action": "अभ्यासक्रम पहा" },
            { "step": 3, "title": "मोफत टूलकिट आणि योजना लाभ", "badge": "टूलकिट सहाय्य", "description": "शासकीय योजनांतर्गत अत्याधुनिक उपकरणे मिळवा.", "action": "योजना पहा" },
            { "step": 4, "title": "रोजगार व व्यवसाय स्थापना", "badge": "प्रमाणित तंत्रज्ञ", "description": f"{role_name} म्हणून उत्तम रोजगाराच्या संधी किंवा स्वतःचा व्यवसाय.", "action": "संधी शोधा" }
        ]

    elif clean_lang == "bn":
        suitability = (
            f"আপনার ভয়েস অ্যাসেসমেন্ট অনুযায়ী আপনার সবচেয়ে উপযুক্ত জীবিকা: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% সামঞ্জস্য)। আপনার {occ_str} অভিজ্ঞতা ও "
            f"'{matched_skills_str}' দক্ষতা এর সাথে দারুণভাবে মেলে।"
        )
        dev_summary = (
            f"দক্ষতা বৃদ্ধির মূল পদক্ষেপ: "
            f"1) RPL-এর মাধ্যমে সরকারি NSQF সার্টিফিকেট পান। "
            f"2) '{missing_skills_str}'-এর জন্য ব্রিজ ট্রেনিং নিন। "
            f"3) পিএম বিশ্বকর্মা বা PMKVY-র অধীনে বিনামূল্যে টুলকিট এবং অর্থ সাহায্য পান।"
        )
        roadmap = [
            { "step": 1, "title": "পূর্ব অভিজ্ঞতার স্বীকৃতি (RPL)", "badge": "১২ ঘণ্টার ওরিয়েন্টেশন", "description": "আপনার কাজের অভিজ্ঞতার জন্য সরকারি স্বীকৃতি পান।", "action": "RPL আবেদন" },
            { "step": 2, "title": "ব্রিজ স্কিল ট্রেনিং", "badge": "প্রয়োজনীয় দক্ষতা", "description": f"'{missing_skills_str}' দক্ষতার উপর প্রশিক্ষণ নিন।", "action": "কোর্স দেখুন" },
            { "step": 3, "title": "বিনামূল্যে টুলকিট ও সহায়তা", "badge": "টুলকিট কিট", "description": "আধুনিক যন্ত্রপাতির জন্য সরকারি অনুদান নিন।", "action": "প্রকল্প বিবরণ" },
            { "step": 4, "title": "চাকরি ও স্বনির্ভরতা", "badge": "সার্টিফাইড কর্মী", "description": f"{role_name} হিসেবে নিশ্চিত আয়ের সুযোগ তৈরি করুন।", "action": "সুযোগ দেখুন" }
        ]

    elif clean_lang == "gu":
        suitability = (
            f"તમારા વૉઇસ મૂલ્યાંકન મુજબ તમારા માટે શ્રેષ્ઠ કારકિર્દી: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% મેળ). તમારો {occ_str} નો અનુભવ અને "
            f"'{matched_skills_str}' કુશળતા આ માટે યોગ્ય પાયો છે."
        )
        dev_summary = (
            f"કૌશલ્ય વિકાસ માટે માર્ગદર્શન: "
            f"1) RPL દ્વારા સરકારી NSQF પ્રમાણપત્ર મેળવો. "
            f"2) '{missing_skills_str}' માટે બ્રિજ ટ્રેનિંગ પૂર્ણ કરો. "
            f"3) પીએમ વિશ્વકર્મા કે PMKVY હેઠળ નિઃશુલ્ક ટૂલકિટ મેળવો."
        )
        roadmap = [
            { "step": 1, "title": "પૂર્વ અનુભવની માન્યતા (RPL)", "badge": "૧૨ કલાક ઓરિએન્ટેશન", "description": "તમારા અનુભવ માટે અધિકૃત સરકારી સર્ટિફિકેટ મેળવો.", "action": "RPL રજીસ્ટ્રેશન" },
            { "step": 2, "title": "બ્રિજ કૌશલ્ય તાલીમ", "badge": "નવી કુશળતા", "description": f"'{missing_skills_str}' કુશળતા માટે તાલીમ લો.", "action": "કોર્સ જુઓ" },
            { "step": 3, "title": "નિઃશુલ્ક ટૂલકિટ અને સહાય", "badge": "ટૂલકિટ", "description": "સરકારી યોજના હેઠળ આધુનિક સાધન સામગ્રી મેળવો.", "action": "યોજના જુઓ" },
            { "step": 4, "title": "રોજગાર અને સ્વરોજગાર", "badge": "પ્રમાણિત કુશળ", "description": f"{role_name} તરીકે સ્થિર આવકની તકો પ્રાપ્ત કરો.", "action": "તકો શોધો" }
        ]

    elif clean_lang == "pa":
        suitability = (
            f"ਤੁਹਾਡੇ ਵਾਇਸ ਮੁਲਾਂਕਣ ਅਨੁਸਾਰ ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਢੁਕਵਾਂ ਰੋਜ਼ਗਾਰ: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% ਮੇਲ)। ਤੁਹਾਡਾ {occ_str} ਦਾ ਤਜਰਬਾ ਅਤੇ "
            f"'{matched_skills_str}' ਹੁਨਰ ਇਸ ਕੰਮ ਲਈ ਬਹੁਤ ਮਦਦਗਾਰ ਹਨ।"
        )
        dev_summary = (
            f"ਹੁਨਰ ਵਿਕਾਸ ਲਈ ਕਦਮ: "
            f"1) RPL ਰਾਹੀਂ ਸਰਕਾਰੀ NSQF ਸਰਟੀਫਿਕੇਟ ਪ੍ਰਾਪਤ ਕਰੋ। "
            f"2) '{missing_skills_str}' ਹੁਨਰ ਲਈ ਬ੍ਰਿਜ ਕੋਰਸ ਪੂਰਾ ਕਰੋ। "
            f"3) ਪੀਐਮ ਵਿਸ਼ਵਕਰਮਾ ਜਾਂ PMKVY ਤਹਿਤ ਮੁਫ਼ਤ ਟੂਲਕਿੱਟ ਅਤੇ ਸਹਾਇਤਾ ਲਵੋ।"
        )
        roadmap = [
            { "step": 1, "title": "ਪੁਰਾਣੇ ਤਜਰਬੇ ਦੀ ਮਾਨਤਾ (RPL)", "badge": "12 ਘੰਟੇ ਓਰੀਐਂਟੇਸ਼ਨ", "description": "ਸਰਕਾਰੀ NSQF ਸਰਟੀਫਿਕੇਟ ਮੁਫ਼ਤ ਪ੍ਰਾਪਤ ਕਰੋ।", "action": "RPL ਰਜਿਸਟ੍ਰੇਸ਼ਨ" },
            { "step": 2, "title": "ਬ੍ਰਿਜ ਹੁਨਰ ਸਿਖਲਾਈ", "badge": "ਹੁਨਰ ਸੁਧਾਰ", "description": f"'{missing_skills_str}' ਹੁਨਰ ਵਿੱਚ ਮੁਹਾਰਤ ਹਾਸਲ ਕਰੋ।", "action": "ਕੋਰਸ ਦੇਖੋ" },
            { "step": 3, "title": "ਮੁਫ਼ਤ ਟੂਲਕਿੱਟ ਅਤੇ ਸਹਾਇਤਾ", "badge": "ਟੂਲਕਿੱਟ", "description": "ਸਰਕਾਰੀ ਸਕੀਮ ਅਧੀਨ ਨਵੇਂ ਔਜ਼ਾਰ ਪ੍ਰਾਪਤ ਕਰੋ।", "action": "ਸਕੀਮ ਦੇਖੋ" },
            { "step": 4, "title": "ਰੋਜ਼ਗਾਰ ਅਤੇ ਸਵੈ-ਰੋਜ਼ਗਾਰ", "badge": "ਸਰਟੀਫਾਈਡ ਵਰਕਰ", "description": f"{role_name} ਵਜੋਂ ਆਪਣੀ ਆਮਦਨ ਵਧਾਓ।", "action": "ਮੌਕੇ ਦੇਖੋ" }
        ]

    elif clean_lang == "or":
        suitability = (
            f"ଆପଣଙ୍କ ଭଏସ୍ ଆକଳନ ଅନୁଯାୟୀ ଆପଣଙ୍କ ପାଇଁ ସର୍ବୋତ୍ତମ ଜୀବିକା: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% ମେଳ)। ଆପଣଙ୍କ {occ_str} ଅଭିଜ୍ଞତା ଓ "
            f"'{matched_skills_str}' ଦକ୍ଷତା ଏହି କାମ ପାଇଁ ଉପଯୁକ୍ତ ଅଟେ।"
        )
        dev_summary = (
            f"ଦକ୍ଷତା ବୃଦ୍ଧି ପାଇଁ ପଦକ୍ଷେପ: "
            f"1) RPL ମାଧ୍ୟମରେ ସରକାରୀ NSQF ସାର୍ଟିଫିକେଟ୍ ପ୍ରାପ୍ତ କରନ୍ତୁ। "
            f"2) '{missing_skills_str}' ଦକ୍ଷତା ପାଇଁ ବ୍ରିଜ୍ ତାଲିମ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ। "
            f"3) ପିଏମ୍ ବିଶ୍ୱକର୍ମା ବା PMKVY ଅଧୀନରେ ମାଗଣା ଟୁଲକିଟ୍ ପାଆନ୍ତୁ।"
        )
        roadmap = [
            { "step": 1, "title": "ପୂର୍ବ ଅଭିଜ୍ଞତାର ମାନ୍ୟତା (RPL)", "badge": "୧୨ ଘଣ୍ଟା ଓରିଏଣ୍ଟେସନ୍", "description": "ସରକାରୀ NSQF ସାର୍ଟିଫିକେଟ୍ ହାସଲ କରନ୍ତୁ।", "action": "RPL ପଞ୍ଜୀକରଣ" },
            { "step": 2, "title": "ବ୍ରିଜ୍ ଦକ୍ଷତା ତାଲିମ", "badge": "ଆବଶ୍ୟକ ଦକ୍ଷତା", "description": f"'{missing_skills_str}' ପାଇଁ ବ୍ୟବହାରିକ ତାଲିମ ନିଅନ୍ତୁ।", "action": "କୋର୍ସ ଦେଖନ୍ତୁ" },
            { "step": 3, "title": "ମାଗଣା ଟୁଲକିଟ୍ ଓ ଯୋଜନା ସୁବିଧା", "badge": "ଟୁଲକିଟ୍", "description": "ଆଧୁନିକ ଉପକରଣ ଓ ଆର୍ଥିକ ସହାୟତା ପାଆନ୍ତୁ।", "action": "ଯୋଜନା ଦେଖନ୍ତୁ" },
            { "step": 4, "title": "ରୋଜଗାର ଓ ଆୟ ବୃଦ୍ଧି", "badge": "ପ୍ରମାଣିତ କାରିଗର", "description": f"{role_name} ଭାବରେ ସ୍ଥାୟୀ ଜୀବିକା ଗଠନ କରନ୍ତୁ।", "action": "ସୁଯୋଗ ଖୋଜନ୍ତୁ" }
        ]

    else:
        # Default English
        suitability = (
            f"Based on your voice assessment, the most suitable livelihood pathway for you is: **{role_name}** "
            f"({nsqf_level}, {match_score:.0f}% Match fit). Your background in {occ_str} and demonstrated "
            f"competencies in '{matched_skills_str}' provide a solid, proven foundation for this qualification."
        )
        dev_summary = (
            f"Actionable 4-step roadmap to develop your skills and maximize your livelihood income: "
            f"1) Obtain official government NSQF certification through fast-track Recognition of Prior Learning (RPL). "
            f"2) Complete targeted short-term bridge training for '{missing_skills_str}'. "
            f"3) Avail accredited toolkits and financial support under PMKVY 4.0 or PM Vishwakarma. "
            f"4) Secure formal wage employment or launch your certified micro-enterprise to increase earnings by 40-60%."
        )
        roadmap = [
            {
                "step": 1,
                "title": "Recognition of Prior Learning (RPL Certification)",
                "badge": "12-Hour Orientation",
                "description": f"Convert your informal {occ_str} experience into an official government-accredited NSQF certificate at zero cost.",
                "action": "Enroll in RPL Assessment"
            },
            {
                "step": 2,
                "title": "Bridge Competency Training",
                "badge": f"{len(missing_skills[:3])} Gap Skills",
                "description": f"Master critical gap competencies: '{missing_skills_str}' via short-term practical modules.",
                "action": "View Bridge Courses"
            },
            {
                "step": 3,
                "title": "Modern Toolkits & Government Schemes",
                "badge": "Subsidized / Free Kit",
                "description": "Access modern safety equipment, toolkits, and financial grants under PM Vishwakarma or PMKVY.",
                "action": "Check Scheme Eligibility"
            },
            {
                "step": 4,
                "title": "Livelihood Placement & Enterprise Growth",
                "badge": "Certified Professional",
                "description": f"Transition into certified {role_name} wage roles or access collateral-free Mudra micro-loans.",
                "action": "Explore Placements & Loans"
            }
        ]

    return suitability, dev_summary, roadmap


def process_voice_assessment(submission: VoiceSessionSubmission) -> VoiceSessionResult:
    """
    Consolidate voice responses from the conversational assessment, extract
    structured candidate profile, identify canonical skills, rank NSQF pathways,
    and formulate personalized skill development guidance in the candidate's chosen language.
    """
    session_id = submission.session_id or str(uuid.uuid4())[:8]
    summary: Dict[str, Any] = {}
    collected_text_parts: List[str] = []

    # 1. Collect spoken answers
    if submission.answers:
        for ans in submission.answers:
            text = ans.get_text() if hasattr(ans, "get_text") else (ans.user_transcript or "")
            cleaned = clean_voice_text(text)
            key = ans.question_key or f"q_{ans.question_id}"
            if cleaned:
                summary[key] = cleaned
                collected_text_parts.append(cleaned)
            else:
                summary[key] = "unknown"

    # 2. Add full continuous transcript if provided
    if submission.full_transcript:
        clean_full = clean_voice_text(submission.full_transcript)
        if clean_full:
            summary["raw_continuous_transcript"] = clean_full
            collected_text_parts.append(clean_full)

    full_text = ". ".join(collected_text_parts) if collected_text_parts else ""
    target_language = (submission.language or "en").lower()

    # If transcript is empty, return graceful default
    if not full_text.strip():
        return VoiceSessionResult(
            session_id=session_id,
            questions_completed=len([k for k, v in summary.items() if v != "unknown"]),
            language=target_language,
            extracted_summary=summary,
            recommended_role="General Technical Assistant",
            nsqf_level="NSQF Level 3",
            match_score=75.0,
            status="success"
        )

    # 3. AI Extraction: Structured profile & canonical skills
    try:
        extracted_profile, _ = extract_structured_profile(full_text)
        skills_objs = extract_and_normalize_skills(full_text)
        canonical_skills = [s.canonical_name for s in skills_objs]
        skills_detailed = [s.model_dump() for s in skills_objs]
    except Exception as exc:
        extracted_profile = None
        canonical_skills = []
        skills_detailed = []

    # 4. NSQF Pathway Recommendation & Competency Gap Analysis
    education_val = extracted_profile.education if extracted_profile else "10th Standard"
    occupation_val = extracted_profile.prior_occupation if extracted_profile else "General Work"
    exp_val = extracted_profile.experience_years if extracted_profile else 1.0
    goal_val = extracted_profile.livelihood_goal if extracted_profile else "employment"
    resources_val = extracted_profile.resources if extracted_profile else []
    constraints_val = extracted_profile.constraints if extracted_profile else []

    try:
        ranked = rank_livelihood_recommendations(
            education=education_val,
            prior_occupation=occupation_val,
            experience_years=exp_val,
            livelihood_goal=goal_val,
            candidate_skills=canonical_skills,
            resources=resources_val,
            constraints=constraints_val
        )
    except Exception:
        ranked = []

    if ranked:
        top_match = ranked[0]
        rec_role = top_match.get("qualification_name", "Domestic Electrician Assistant")
        qp_code = top_match.get("qp_code", "ELE/Q1401")
        nsqf_lvl = top_match.get("nsqf_level", "NSQF Level 3")
        score = float(top_match.get("match_score", 85.0))
        matched_sk = top_match.get("matched_skills", canonical_skills[:3])
        missing_sk = top_match.get("missing_skills", [
            "Advanced Equipment Operation",
            "Workplace Safety Standards",
            "Digital Payments & Records"
        ])
    else:
        rec_role = "Domestic Electrician Assistant"
        qp_code = "ELE/Q1401"
        nsqf_lvl = "NSQF Level 3"
        score = 82.0
        matched_sk = canonical_skills[:3] if canonical_skills else ["Practical Work Experience"]
        missing_sk = [
            "Advanced Equipment Operation",
            "Workplace Safety Standards",
            "Digital Payments & Records"
        ]

    # 5. Multilingual guidance generation (What suits him & How to develop himself)
    suitability, dev_summary, roadmap = generate_vernacular_guidance(
        lang=target_language,
        role_name=rec_role,
        nsqf_level=nsqf_lvl,
        match_score=score,
        prior_occupation=occupation_val,
        matched_skills=matched_sk,
        missing_skills=missing_sk,
        livelihood_goal=goal_val,
        resources=resources_val
    )

    # 6. Structured learning actions to develop his skills
    learning_actions = [
        {
            "skill_name": sk,
            "category": "Gap Competency",
            "estimated_hours": 15 + (i * 10),
            "priority": "High" if i == 0 else "Medium",
            "recommended_mode": "PMKVY Bridge Course / Skill India Digital"
        }
        for i, sk in enumerate(missing_sk[:4])
    ]

    profile_dict = extracted_profile.model_dump() if extracted_profile else {
        "education": education_val,
        "qualification": "Standard",
        "experience_years": exp_val,
        "prior_occupation": occupation_val,
        "livelihood_goal": goal_val,
        "resources": resources_val,
        "constraints": constraints_val
    }

    return VoiceSessionResult(
        session_id=session_id,
        questions_completed=len([k for k, v in summary.items() if v != "unknown"]),
        language=target_language,
        extracted_summary=summary,
        profile=profile_dict,
        extracted_skills=canonical_skills,
        skills_extracted_detailed=skills_detailed,
        recommended_role=rec_role,
        qp_code=qp_code,
        nsqf_level=nsqf_lvl,
        match_score=round(score, 1),
        suitability_explanation=suitability,
        development_roadmap=roadmap,
        development_summary=dev_summary,
        skills_to_develop=missing_sk,
        learning_actions=learning_actions,
        status="success"
    )
