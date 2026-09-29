import re
import uuid
from typing import List, Dict, Any
from app.schemas.voice import VoiceQuestion, VoiceSessionSubmission, VoiceSessionResult

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


def process_voice_assessment(submission: VoiceSessionSubmission) -> VoiceSessionResult:
    """Consolidate voice responses from the 9 conversational questions."""
    session_id = str(uuid.uuid4())[:8]
    summary: Dict[str, Any] = {}

    for ans in submission.answers:
        text = clean_voice_text(ans.user_transcript)
        if text:
            summary[ans.question_key] = text
        else:
            summary[ans.question_key] = "unknown"

    # If a single continuous transcript was provided
    if submission.full_transcript:
        summary["raw_continuous_transcript"] = clean_voice_text(submission.full_transcript)

    return VoiceSessionResult(
        session_id=session_id,
        questions_completed=len([k for k, v in summary.items() if v != "unknown"]),
        language=submission.language or "en",
        extracted_summary=summary
    )
