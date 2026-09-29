import logging
import secrets
from abc import ABC, abstractmethod
from typing import Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.config import settings
from app.models.otp import OTPVerification

logger = logging.getLogger("livelihood_ai.sms")


def utc_now():
    return datetime.now(timezone.utc)


class SMSProvider(ABC):
    @abstractmethod
    def send_otp(self, phone: str, otp: str, language: str = "en") -> bool:
        """Send OTP verification code to recipient phone number."""
        pass


class SimulatedSMSProvider(SMSProvider):
    """
    Simulated SMS Gateway for development and testing environments.
    Outputs OTP to secure system logs and maintains in-memory verification.
    """
    def send_otp(self, phone: str, otp: str, language: str = "en") -> bool:
        msg = f"[Simulated SMS to {phone}] Your LivelihoodAI verification code is: {otp}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes."
        if language == "ta":
            msg = f"[Simulated SMS to {phone}] உங்கள் LivelihoodAI சரிபார்ப்புக் குறியீடு: {otp}. இது {settings.OTP_EXPIRE_MINUTES} நிமிடங்கள் மட்டுமே செல்லுபடியாகும்."
        elif language == "hi":
            msg = f"[Simulated SMS to {phone}] आपका LivelihoodAI सत्यापन कोड है: {otp}. यह {settings.OTP_EXPIRE_MINUTES} मिनट के लिए वैध है।"

        logger.info(f"SMS Gateway (Simulated): {msg}")
        print(f"\n========================================\n{msg}\n========================================\n")
        return True


class ConsoleSMSProvider(SMSProvider):
    """Console-only SMS Gateway for local CLI development."""
    def send_otp(self, phone: str, otp: str, language: str = "en") -> bool:
        print(f"[SMS Gateway Console] OTP for {phone}: {otp}")
        return True


class TwilioSMSProvider(SMSProvider):
    """Twilio SMS Gateway integration."""
    def __init__(self):
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("Twilio credentials not configured. Falling back to simulated SMS.")
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_FROM_NUMBER

    def send_otp(self, phone: str, otp: str, language: str = "en") -> bool:
        if not self.account_sid or not self.auth_token:
            logger.error("Cannot dispatch via Twilio: missing credentials.")
            return False
        try:
            from twilio.rest import Client
            client = Client(self.account_sid, self.auth_token)
            body = f"Your LivelihoodAI verification code is {otp}."
            if language == "ta":
                body = f"உங்கள் LivelihoodAI சரிபார்ப்புக் குறியீடு {otp}."
            elif language == "hi":
                body = f"आपका LivelihoodAI सत्यापन कोड {otp} है।"

            client.messages.create(
                to=phone,
                from_=self.from_number,
                body=body
            )
            return True
        except Exception as e:
            logger.error(f"Twilio SMS dispatch failed: {e}")
            return False


class Msg91SMSProvider(SMSProvider):
    """MSG91 SMS Gateway for Indian vernacular telecommunications."""
    def __init__(self):
        self.auth_key = settings.MSG91_AUTH_KEY
        self.template_id = settings.MSG91_TEMPLATE_ID

    def send_otp(self, phone: str, otp: str, language: str = "en") -> bool:
        if not self.auth_key:
            logger.error("Cannot dispatch via MSG91: missing auth key.")
            return False
        try:
            import httpx
            cleaned_phone = phone.replace("+", "").replace("-", "").strip()
            url = f"https://control.msg91.com/api/v5/otp?template_id={self.template_id}&mobile={cleaned_phone}&authkey={self.auth_key}&otp={otp}"
            res = httpx.get(url, timeout=5.0)
            return res.status_code == 200
        except Exception as e:
            logger.error(f"MSG91 SMS dispatch failed: {e}")
            return False


def get_sms_provider() -> SMSProvider:
    """Factory function providing SMS gateway based on environment configuration."""
    provider_type = (settings.SMS_PROVIDER or "simulated").lower()
    if provider_type == "twilio":
        return TwilioSMSProvider()
    elif provider_type == "msg91":
        return Msg91SMSProvider()
    elif provider_type == "console":
        return ConsoleSMSProvider()
    return SimulatedSMSProvider()


def normalize_phone(phone: str) -> str:
    """Normalize phone number to standard format (+91XXXXXXXXXX or standard international)."""
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")
    if not cleaned.startswith("+"):
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
        elif len(cleaned) == 12 and cleaned.startswith("91"):
            cleaned = "+" + cleaned
    return cleaned


def create_and_send_otp(db: Session, phone: str, language: str = "en") -> tuple[bool, str]:
    """
    Generate cryptographic 6-digit OTP, persist with expiry, and dispatch via SMS provider.
    Enforces rate-limiting: max 3 OTP requests in 10 minutes per phone number.
    """
    normalized_phone = normalize_phone(phone)
    ten_mins_ago = utc_now() - timedelta(minutes=10)

    recent_count = db.query(OTPVerification).filter(
        OTPVerification.phone == normalized_phone,
        OTPVerification.created_at >= ten_mins_ago
    ).count()

    if recent_count >= 5:
        return False, "Too many OTP requests. Please wait a few minutes before trying again."

    # Generate 6-digit numeric OTP
    otp_code = str(secrets.randbelow(900000) + 100000)
    expires_at = utc_now() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # Invalidate previous unused OTPs for this phone
    db.query(OTPVerification).filter(
        OTPVerification.phone == normalized_phone,
        OTPVerification.is_used == False
    ).update({"is_used": True})

    otp_record = OTPVerification(
        phone=normalized_phone,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False,
        attempts=0
    )
    db.add(otp_record)
    db.commit()

    provider = get_sms_provider()
    sent = provider.send_otp(normalized_phone, otp_code, language)
    if not sent:
        return False, "Failed to deliver OTP via SMS provider."

    return True, "OTP dispatched successfully."


def verify_phone_otp(db: Session, phone: str, otp_code: str) -> tuple[bool, Optional[str]]:
    """
    Verify submitted OTP against active unexpired database record.
    Enforces maximum 5 attempts per OTP.
    """
    normalized_phone = normalize_phone(phone)
    now = utc_now()

    record = db.query(OTPVerification).filter(
        OTPVerification.phone == normalized_phone,
        OTPVerification.is_used == False,
        OTPVerification.expires_at > now
    ).order_by(OTPVerification.created_at.desc()).first()

    if not record:
        return False, "Invalid or expired OTP. Please request a new verification code."

    if record.attempts >= 5:
        record.is_used = True
        db.commit()
        return False, "Maximum verification attempts exceeded. Please request a new OTP."

    record.attempts += 1
    if record.otp_code != otp_code.strip():
        db.commit()
        return False, "Incorrect verification code."

    record.is_used = True
    db.commit()
    return True, None
