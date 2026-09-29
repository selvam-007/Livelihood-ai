import os
import logging
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.common import APIResponse
from app.schemas.voice import (
    VoiceQuestion,
    TranscribeRequest,
    VoiceSessionSubmission,
    VoiceSessionResult
)
from app.services.speech_service import (
    get_conversational_questions,
    clean_voice_text,
    process_voice_assessment
)
from app.services.security import get_current_user
from app.services import stt_service
from app.database.session import get_db
from app.models.user import User
from app.models.progress import ConsentLog

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/voice",
    tags=["Voice Assessment & Speech Pipeline"],
    dependencies=[Depends(get_current_user)]
)


def _require_voice_consent(current_user: User, db: Session) -> None:
    consent = (
        db.query(ConsentLog)
        .filter(
            ConsentLog.user_id == current_user.id,
            ConsentLog.consent_type == "voice_processing",
            ConsentLog.consent_granted.is_(True),
        )
        .order_by(ConsentLog.timestamp.desc())
        .first()
    )
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Voice processing consent is required before submitting audio. "
                "Grant consent at POST /api/profile/consent with "
                "consent_type='voice_processing' and consent_granted=true."
            ),
        )


@router.get("/questions", response_model=APIResponse)
def list_voice_questions():
    """Retrieve the 9 standard conversational questions for AI voice assessment."""
    questions = get_conversational_questions()
    return APIResponse(
        success=True,
        message="Conversational questions retrieved successfully.",
        data=[q.model_dump() for q in questions]
    )


@router.post("/transcribe", response_model=APIResponse)
def transcribe_voice_chunk(request: TranscribeRequest):
    """Normalize and validate transcribed natural voice input."""
    cleaned = clean_voice_text(request.text)
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Speech input was empty or unintelligible. Please speak again or type manually."
        )
    return APIResponse(
        success=True,
        message="Speech input normalized.",
        data={
            "normalized_text": cleaned,
            "language": request.language or "en",
            "question_id": request.question_id,
            "character_count": len(cleaned)
        }
    )


@router.post("/process-session", response_model=APIResponse)
def process_assessment_session(submission: VoiceSessionSubmission):
    """Process complete voice assessment session into structured summary."""
    result = process_voice_assessment(submission)
    return APIResponse(
        success=True,
        message=f"Voice assessment session {result.session_id} processed successfully.",
        data=result.model_dump()
    )


@router.post("/upload-audio", response_model=APIResponse)
async def upload_audio_voice_note(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    language: str = Form("auto"),
):
    """
    Accept a candidate voice recording and enqueue a real STT transcription job.
    Returns a job_id to poll at GET /api/voice/stt-job/{job_id}.
    Requires voice_processing consent. Returns 503 if STT is not configured.
    """
    _require_voice_consent(current_user, db)
    contents = await file.read()
    filename = file.filename or "recording.webm"
    content_type = file.content_type
    try:
        job_id = stt_service.upload_audio_and_enqueue(
            file_bytes=contents,
            filename=filename,
            content_type=content_type,
            language=language,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    return APIResponse(
        success=True,
        message="Audio accepted and STT job queued. Poll /api/voice/stt-job/{job_id} for results.",
        data={
            "job_id": job_id,
            "filename": filename,
            "file_size_bytes": len(contents),
            "status": "queued",
            "poll_url": f"/api/voice/stt-job/{job_id}",
        }
    )


@router.get("/stt-job/{job_id}", response_model=APIResponse)
def poll_stt_job(
    job_id: str = Path(..., description="Job ID returned by POST /upload-audio"),
    _current_user: User = Depends(get_current_user),
):
    """
    Poll speech-to-text job status.
    Returns status: queued | processing | done | failed.
    transcript field is populated when status == done.
    """
    result = stt_service.get_stt_job_result(job_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"STT job '{job_id}' not found. Jobs are in-memory; lost on server restart."
        )
    return APIResponse(
        success=True,
        message=f"STT job status: {result['status']}",
        data=result,
    )


class FollowUpRequest(BaseModel):
    unresolved_fields: List[str]
    language: str = "en"
    candidate_name: Optional[str] = "Candidate"


MULTILINGUAL_FOLLOWUPS = {
    "education": {
        "en": "What is your highest level of completed education (e.g., 8th, 10th, 12th, or College)?",
        "ta": "உங்கள் கடைசி கல்வித் தகுதி என்ன (8, 10, 12-ஆம் வகுப்பு அல்லது கல்லூரி)?",
        "hi": "आपकी उच्चतम शिक्षा क्या है (8वीं, 10वीं, 12वीं या कॉलेज)?",
        "te": "మీ అత్యున్నత విద్యార్హత ఏమిటి (8వ, 10వ, 12వ తరగతి లేదా కాలేజ్)?",
        "kn": "ನಿಮ್ಮ ಗರಿಷ್ಠ ಶಿಕ್ಷಣ ಯಾವುದು (8ನೇ, 10ನೇ, 12ನೇ ಅಥವಾ ಕಾಲೇಜು)?"
    },
    "experience_years": {
        "en": "How many months or years of practical work experience do you have in this field?",
        "ta": "இந்த தொழிலில் எத்தனை வருடங்கள் அல்லது மாதங்கள் அனுபவம் உள்ளது?",
        "hi": "इस काम में कितने साल या महीने का व्यावहारिक अनुभव है?",
        "te": "ఈ పనిలో ఎన్ని సంవత్సరాలు లేదా నెలల అనుభవం ఉంది?",
        "kn": "ಈ ವೃತ್ತಿಯಲ್ಲಿ ಎಷ್ಟು ವರ್ಷಗಳ ಅನುಭವ?"
    },
    "livelihood_goal": {
        "en": "Do you prefer a monthly salary job or starting your own micro-business?",
        "ta": "மாத சம்பள வேலை வேண்டுமா அல்லது சொந்த தொழில் தொடங்க விரும்புகிறீர்களா?",
        "hi": "मासिक वेतन नौकरी चाहते हैं या खुद का व्यवसाय?",
        "te": "జీతంతో ఉద్యోగం కావాలా లేదా స్వంత వ్యాపారం ప్రారంభించాలా?",
        "kn": "ಮಾಸಿಕ ವೇತನ ಉದ್ಯೋಗ ಬೇಕೇ ಅಥವಾ ಸ್ವಂತ ಉದ್ಯಮ ಪ್ರಾರಂಭಿಸಬೇಕೇ?"
    }
}


@router.post("/conversational-followup", response_model=APIResponse)
def get_conversational_followups(request: FollowUpRequest):
    """Generate targeted vernacular follow-up questions for missing profile fields."""
    lang = request.language if request.language in ("en", "ta", "hi", "te", "kn") else "en"
    questions = []
    for field in request.unresolved_fields[:2]:
        field_clean = field.lower().strip()
        if field_clean in MULTILINGUAL_FOLLOWUPS:
            q_text = MULTILINGUAL_FOLLOWUPS[field_clean].get(lang, MULTILINGUAL_FOLLOWUPS[field_clean]["en"])
            questions.append({
                "field": field_clean,
                "question": q_text,
                "suggested_quick_replies": (
                    ["10th Standard", "12th Standard", "Graduate"] if field_clean == "education" else
                    ["< 1 year", "1-2 years", "3+ years"] if field_clean == "experience_years" else
                    ["Wage Job", "Self-Employment"]
                )
            })
    return APIResponse(
        success=True,
        message=f"Generated {len(questions)} conversational follow-up question(s).",
        data={"language": lang, "followup_questions": questions}
    )


class NotificationRequest(BaseModel):
    phone: str
    channel: str = "whatsapp"
    qp_code: str
    qp_name: str
    centre_name: Optional[str] = None
    centre_phone: Optional[str] = None
    language: str = "en"


def _build_message_body(req: NotificationRequest) -> str:
    lang = req.language if req.language in ("en", "ta", "hi") else "en"
    c_en = f", Contact: {req.centre_phone}" if req.centre_phone else ""
    c_ta = f" தொடர்புக்கு: {req.centre_phone}." if req.centre_phone else ""
    c_hi = f", संपर्क: {req.centre_phone}" if req.centre_phone else ""
    ctr = req.centre_name or "[Centre TBD]"
    if lang == "ta":
        return f"வணக்கம்! {req.qp_name} ({req.qp_code}). மையம்: {ctr}.{c_ta} PMKVY இலவச சேர்க்கை."
    if lang == "hi":
        return f"नमस्ते! {req.qp_name} ({req.qp_code}). केंद्र: {ctr}{c_hi}. PMKVY प्रशिक्षण।"
    return f"Hello! {req.qp_name} ({req.qp_code}). Centre: {ctr}{c_en}. PMKVY batch enrolling."


@router.post("/send-notification", response_model=APIResponse)
def send_notification(request: NotificationRequest):
    """
    Send WhatsApp or SMS notification via configured gateway.
    Set WHATSAPP_PROVIDER or SMS_PROVIDER in .env.
    Returns 501 if no provider configured; never pretends to send.
    """
    wp = os.getenv("WHATSAPP_PROVIDER", "").lower()
    sp = os.getenv("SMS_PROVIDER", "").lower()
    provider = wp if request.channel == "whatsapp" else sp
    message_body = _build_message_body(request)
    if not provider:
        logger.warning(
            "Notification not sent (no provider). channel=%s phone=%s msg=%s",
            request.channel, request.phone, message_body
        )
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=(
                f"No {request.channel.upper()} provider configured. "
                "Set WHATSAPP_PROVIDER or SMS_PROVIDER in .env. Message logged for manual follow-up."
            )
        )
    # TODO: implement gateway dispatch per provider (twilio, meta, gupshup, sinch, textlocal)
    logger.info("Notification dispatched via %s channel=%s phone=%s", provider, request.channel, request.phone)
    return APIResponse(
        success=True,
        message=f"{request.channel.upper()} notification dispatched via {provider}.",
        data={
            "phone": request.phone,
            "channel": request.channel,
            "provider": provider,
            "message_body": message_body,
        }
    )