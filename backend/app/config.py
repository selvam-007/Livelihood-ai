import os
import secrets
from typing import List, Optional
from pydantic import computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "LivelihoodAI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    # DEBUG defaults to false for production security
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")

    # Security: In production, SECRET_KEY is strictly required with no default
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "" if os.getenv("ENVIRONMENT") == "production" else "development_secret_key_change_in_production_sih2024"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    ALLOWED_ORIGINS: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,https://livelihood-ai.vercel.app"
    )

    # Redis for rate limiting (optional — falls back to in-memory if not set)
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # Number of trusted reverse-proxy hops for X-Forwarded-For (0 = do not trust)
    TRUSTED_PROXY_COUNT: int = int(os.getenv("TRUSTED_PROXY_COUNT", "0"))

    MOCK_EXTERNAL_SERVICES: bool = os.getenv("MOCK_EXTERNAL_SERVICES", "false").lower() in ("true", "1", "yes")
    DEFAULT_LANGUAGE: str = "en"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # SMS & OTP Service Configuration
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "simulated")  # 'simulated', 'console', 'twilio', 'msg91'
    OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_FROM_NUMBER: str = os.getenv("TWILIO_FROM_NUMBER", "")
    MSG91_AUTH_KEY: str = os.getenv("MSG91_AUTH_KEY", "")
    MSG91_TEMPLATE_ID: str = os.getenv("MSG91_TEMPLATE_ID", "")

    # Data Subject Rights & Audio Retention Policy
    DELETE_AUDIO_AFTER_TRANSCRIPTION: bool = os.getenv("DELETE_AUDIO_AFTER_TRANSCRIPTION", "true").lower() in ("true", "1", "yes")
    AUDIO_RETENTION_HOURS: int = int(os.getenv("AUDIO_RETENTION_HOURS", "0"))

    # Evaluation / Demo mode flag
    ALLOW_DEMO_SEEDING: bool = True

    @computed_field
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @computed_field
    @property
    def docs_url(self) -> Optional[str]:
        """Disable Swagger UI documentation in production environments."""
        return None if self.ENVIRONMENT == "production" else "/docs"

    @computed_field
    @property
    def redoc_url(self) -> Optional[str]:
        """Disable ReDoc documentation in production environments."""
        return None if self.ENVIRONMENT == "production" else "/redoc"

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if not self.SECRET_KEY or not self.SECRET_KEY.strip():
                raise ValueError(
                    "FATAL SECURITY ERROR: SECRET_KEY environment variable is strictly required in production."
                )
            insecure_markers = ["change_in_production", "development", "secret", "1234", "sih2024"]
            if any(marker in self.SECRET_KEY.lower() for marker in insecure_markers):
                raise ValueError(
                    "FATAL SECURITY ERROR: A secure, cryptographically random SECRET_KEY must be "
                    "configured in production environments. Generate one with `openssl rand -hex 32`."
                )
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()