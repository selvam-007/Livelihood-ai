"""
Speech-to-Text (STT) Service with provider interface.

Supported providers (controlled by STT_PROVIDER env var):
  - "whisper"   : OpenAI-compatible Whisper endpoint (OPENAI_API_BASE + OPENAI_API_KEY)
                  or local faster-whisper if WHISPER_LOCAL_MODEL is set.
  - "bhashini"  : Bhashini ULCA endpoint (stub – requires BHASHINI_API_KEY credentials).
  - "disabled"  : Returns HTTP 503. Never returns fake text.

Job-based: upload_audio_and_enqueue() validates the file and returns a job_id.
           get_stt_job_result()        returns the job status / transcript.
"""

from __future__ import annotations

import io
import logging
import os
import threading
import uuid
from enum import Enum
from typing import Any, Dict, Optional

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (all from environment variables – never hardcoded)
# ---------------------------------------------------------------------------

STT_PROVIDER: str = os.getenv("STT_PROVIDER", "disabled").lower()

# Whisper (OpenAI-compatible) settings
OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "whisper-1")

# Local faster-whisper (runs in-process; only loaded when WHISPER_LOCAL_MODEL is set)
WHISPER_LOCAL_MODEL: str = os.getenv("WHISPER_LOCAL_MODEL", "")

# Bhashini ULCA credentials
BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")
BHASHINI_PIPELINE_ID: str = os.getenv("BHASHINI_PIPELINE_ID", "")

# Limits
MAX_AUDIO_BYTES: int = int(os.getenv("STT_MAX_BYTES", str(10 * 1024 * 1024)))  # 10 MB default
MAX_AUDIO_DURATION_SECONDS: int = int(os.getenv("STT_MAX_DURATION_SECONDS", "120"))  # 2 min

ALLOWED_MIME_PREFIXES = ("audio/",)
ALLOWED_EXTENSIONS = frozenset({".wav", ".mp3", ".webm", ".ogg", ".m4a", ".flac"})


# ---------------------------------------------------------------------------
# In-memory job store (replace with Redis/DB for multi-process deployments)
# ---------------------------------------------------------------------------

_jobs: Dict[str, Dict[str, Any]] = {}
_jobs_lock = threading.Lock()


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


def _new_job() -> str:
    job_id = str(uuid.uuid4())
    with _jobs_lock:
        _jobs[job_id] = {
            "status": JobStatus.QUEUED,
            "transcript": None,
            "error": None,
            "language": None,
        }
    return job_id


def _update_job(job_id: str, **kwargs: Any) -> None:
    with _jobs_lock:
        if job_id in _jobs:
            _jobs[job_id].update(kwargs)


def get_stt_job_result(job_id: str) -> Optional[Dict[str, Any]]:
    """Return the current state of a STT job, or None if job_id is unknown."""
    with _jobs_lock:
        return dict(_jobs[job_id]) if job_id in _jobs else None


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_audio_upload(file_bytes: bytes, filename: str, content_type: Optional[str]) -> str:
    """
    Validate audio upload. Returns the canonical file extension.
    Raises ValueError with a human-readable message on invalid input.
    """
    if len(file_bytes) == 0:
        raise ValueError("Uploaded audio file is empty. Please record audio and retry.")

    if len(file_bytes) > MAX_AUDIO_BYTES:
        mb = MAX_AUDIO_BYTES // (1024 * 1024)
        raise ValueError(
            f"Audio file too large ({len(file_bytes) // 1024} KB). "
            f"Maximum allowed size is {mb} MB."
        )

    ext = os.path.splitext(filename)[1].lower() if filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported audio format '{ext}'. "
            f"Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Content-type sanity check (browser-supplied, informational only)
    if content_type and not any(content_type.startswith(p) for p in ALLOWED_MIME_PREFIXES):
        if content_type not in ("application/octet-stream",):
            raise ValueError(
                f"Content-Type '{content_type}' is not an audio MIME type. "
                "Please upload an audio file."
            )

    # Basic magic-bytes check to detect obviously wrong files
    is_valid_magic = (
        file_bytes[:4] == b"RIFF"                          # wav
        or file_bytes[:3] == b"ID3"                        # mp3 with ID3 tag
        or (len(file_bytes) > 1 and file_bytes[0] == 0xFF and (file_bytes[1] & 0xE0) == 0xE0)  # mp3 sync
        or file_bytes[:4] == b"\x1aE\xdf\xa3"             # webm / matroska
        or file_bytes[:4] == b"OggS"                       # ogg
        or (len(file_bytes) > 11 and b"ftyp" in file_bytes[4:12])  # m4a / mp4
        or file_bytes[:4] == b"fLaC"                       # flac
    )
    if not is_valid_magic:
        raise ValueError(
            "File content does not appear to be a valid audio file. "
            "Please record and upload a real audio file."
        )

    return ext


# ---------------------------------------------------------------------------
# Provider implementations
# ---------------------------------------------------------------------------

def _transcribe_whisper_api(file_bytes: bytes, filename: str, language: str) -> str:
    """Call OpenAI-compatible Whisper transcriptions endpoint."""
    if not OPENAI_API_KEY:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. "
            "Set it in your .env file to use the Whisper STT provider."
        )

    files = {"file": (filename, io.BytesIO(file_bytes), "audio/webm")}
    data: Dict[str, Any] = {"model": WHISPER_MODEL}
    if language and language != "auto":
        data["language"] = language

    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    url = f"{OPENAI_API_BASE.rstrip('/')}/audio/transcriptions"

    with httpx.Client(timeout=90) as client:
        resp = client.post(url, headers=headers, files=files, data=data)

    resp.raise_for_status()
    result = resp.json()
    transcript = result.get("text", "").strip()
    if not transcript:
        raise RuntimeError("Whisper returned an empty transcript.")
    return transcript


def _transcribe_whisper_local(file_bytes: bytes, language: str) -> str:
    """
    Run faster-whisper in-process when WHISPER_LOCAL_MODEL is set.
    Requires: pip install faster-whisper
    Model examples: "tiny", "base", "small", "medium", "large-v3"
    """
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "faster-whisper is not installed. "
            "Run: pip install faster-whisper"
        ) from exc

    model = WhisperModel(WHISPER_LOCAL_MODEL, device="cpu", compute_type="int8")
    audio_io = io.BytesIO(file_bytes)
    lang_arg = language if language and language != "auto" else None
    segments, _info = model.transcribe(audio_io, language=lang_arg, beam_size=5)
    return " ".join(seg.text for seg in segments).strip()


def _transcribe_bhashini(file_bytes: bytes, language: str) -> str:
    """
    Bhashini ULCA ASR pipeline.

    TODO: Obtain credentials from https://bhashini.gov.in/ulca and set:
          BHASHINI_API_KEY, BHASHINI_USER_ID, BHASHINI_PIPELINE_ID

    Reference: https://bhashini.gitbook.io/bhashini-apis/
    """
    if not BHASHINI_API_KEY or not BHASHINI_USER_ID or not BHASHINI_PIPELINE_ID:
        raise RuntimeError(
            "Bhashini credentials are not configured. "
            "Set BHASHINI_API_KEY, BHASHINI_USER_ID, and BHASHINI_PIPELINE_ID in .env."
        )

    import base64
    audio_b64 = base64.b64encode(file_bytes).decode("utf-8")
    source_lang = language if language and language != "auto" else "hi"

    payload = {
        "pipelineTasks": [
            {
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": source_lang},
                    "serviceId": "",   # auto-selected by ULCA
                    "audioFormat": "wav",
                    "samplingRate": 16000,
                },
            }
        ],
        "inputData": {
            "audio": [{"audioContent": audio_b64}],
            "input": [{"source": ""}],
        },
    }

    headers = {
        "userID": BHASHINI_USER_ID,
        "ulcaApiKey": BHASHINI_API_KEY,
        "Content-Type": "application/json",
    }
    url = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    with httpx.Client(timeout=60) as client:
        resp = client.post(url, headers=headers, json=payload)

    resp.raise_for_status()
    result = resp.json()
    try:
        transcript = result["pipelineResponse"][0]["output"][0]["source"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"Unexpected Bhashini response structure: {exc}") from exc

    if not transcript:
        raise RuntimeError("Bhashini returned an empty transcript.")
    return transcript


# ---------------------------------------------------------------------------
# Background worker
# ---------------------------------------------------------------------------

def _run_transcription(job_id: str, file_bytes: bytes, filename: str, language: str) -> None:
    """Background thread: run the appropriate STT provider and update the job store."""
    _update_job(job_id, status=JobStatus.PROCESSING)
    try:
        if STT_PROVIDER == "whisper":
            if WHISPER_LOCAL_MODEL:
                transcript = _transcribe_whisper_local(file_bytes, language)
            else:
                transcript = _transcribe_whisper_api(file_bytes, filename, language)
        elif STT_PROVIDER == "bhashini":
            transcript = _transcribe_bhashini(file_bytes, language)
        else:
            raise RuntimeError(f"Unknown STT provider: {STT_PROVIDER!r}")

        _update_job(job_id, status=JobStatus.DONE, transcript=transcript, language=language)
        logger.info("STT job %s completed (%d chars)", job_id, len(transcript))

    except Exception as exc:
        logger.error("STT job %s failed: %s", job_id, exc, exc_info=True)
        _update_job(job_id, status=JobStatus.FAILED, error=str(exc))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def upload_audio_and_enqueue(
    file_bytes: bytes,
    filename: str,
    content_type: Optional[str],
    language: str = "auto",
) -> str:
    """
    Validate the audio upload and enqueue a background STT job.
    Returns the job_id string.

    Raises:
        ValueError   – invalid file (propagate as HTTP 400)
        RuntimeError – STT disabled or misconfigured (propagate as HTTP 503)
    """
    if STT_PROVIDER == "disabled":
        raise RuntimeError(
            "Speech-to-text is not configured on this server. "
            "Set STT_PROVIDER (whisper | bhashini) and the corresponding credentials in .env "
            "to enable audio transcription."
        )

    validate_audio_upload(file_bytes, filename, content_type)

    job_id = _new_job()
    t = threading.Thread(
        target=_run_transcription,
        args=(job_id, file_bytes, filename, language),
        daemon=True,
    )
    t.start()
    return job_id
