from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel

from app.schemas.common import APIResponse
from app.services.counselor_service import get_intelligent_counselor_response

router = APIRouter(prefix="/counselor", tags=["AI Livelihood & NSQF Counselor"])


class ConversationTurn(BaseModel):
    role: str  # "user" or "model"
    text: str


class CounselorQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[ConversationTurn]] = None


@router.post("/ask", response_model=APIResponse)
def ask_ai_counselor(req: CounselorQueryRequest):
    """
    Multilingual AI Livelihood & NSQF Counselor (Gemini 2.0 Flash):
    Answers any user question regarding:
    - NSQF levels (1–10), Qualification Packs, NOS, NCVET
    - RPL certification process
    - Government schemes: PMKVY, PM Vishwakarma, NAPS, MUDRA, DDU-GKY
    - Platform navigation guide
    - Career & livelihood advice for rural/grassroots users
    Supports 11 Indian languages with multi-turn conversation history.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query text cannot be empty."
        )

    history = [
        {"role": t.role, "text": t.text}
        for t in (req.conversation_history or [])
    ]

    res = get_intelligent_counselor_response(
        query=req.query,
        language=req.language or "en",
        context=req.context or {},
        conversation_history=history
    )

    return APIResponse(
        success=True,
        message="AI counselor response generated successfully.",
        data=res
    )
