"""
Phase 2 tests: real STT service, NOS verification flow, admin analytics empty state,
notification 501, consent enforcement.
"""
import io
import pytest


# ---------------------------------------------------------------------------
# STT Service unit tests (no server needed)
# ---------------------------------------------------------------------------

class TestSttValidation:
    """Tests for stt_service.validate_audio_upload."""

    def test_empty_file_rejected(self):
        from app.services.stt_service import validate_audio_upload
        with pytest.raises(ValueError, match="empty"):
            validate_audio_upload(b"", "recording.wav", "audio/wav")

    def test_oversized_file_rejected(self):
        from app.services.stt_service import validate_audio_upload, MAX_AUDIO_BYTES
        big = b"\x00" * (MAX_AUDIO_BYTES + 1)
        with pytest.raises(ValueError, match="too large"):
            validate_audio_upload(big, "audio.wav", "audio/wav")

    def test_bad_extension_rejected(self):
        from app.services.stt_service import validate_audio_upload
        wav_magic = b"RIFF\x00\x00\x00\x00WAVE"
        with pytest.raises(ValueError, match="Unsupported"):
            validate_audio_upload(wav_magic + b"\x00" * 100, "audio.exe", "audio/wav")

    def test_bad_content_type_rejected(self):
        from app.services.stt_service import validate_audio_upload
        wav_magic = b"RIFF\x00\x00\x00\x00WAVE"
        with pytest.raises(ValueError, match="MIME"):
            validate_audio_upload(wav_magic + b"\x00" * 100, "audio.wav", "video/mp4")

    def test_wrong_magic_bytes_rejected(self):
        from app.services.stt_service import validate_audio_upload
        garbage = b"NOT_AUDIO_AT_ALL" * 50
        with pytest.raises(ValueError, match="valid audio"):
            validate_audio_upload(garbage, "audio.wav", "audio/wav")

    def test_valid_wav_accepted(self):
        from app.services.stt_service import validate_audio_upload
        wav_magic = b"RIFF\x24\x00\x00\x00WAVE"
        ext = validate_audio_upload(wav_magic + b"\x00" * 100, "voice.wav", "audio/wav")
        assert ext == ".wav"

    def test_valid_webm_accepted(self):
        from app.services.stt_service import validate_audio_upload
        webm_magic = b"\x1a\x45\xdf\xa3" + b"\x00" * 100
        ext = validate_audio_upload(webm_magic, "voice.webm", "audio/webm")
        assert ext == ".webm"


class TestSttDisabledMode:
    """When STT_PROVIDER=disabled, upload_audio_and_enqueue raises RuntimeError."""

    def test_disabled_raises_runtime_error(self, monkeypatch):
        import app.services.stt_service as svc
        monkeypatch.setattr(svc, "STT_PROVIDER", "disabled")
        wav_magic = b"RIFF\x24\x00\x00\x00WAVE" + b"\x00" * 100
        with pytest.raises(RuntimeError, match="not configured"):
            svc.upload_audio_and_enqueue(wav_magic, "voice.wav", "audio/wav")


class TestSttJobStore:
    """In-memory job store operations."""

    def test_new_job_starts_queued(self):
        from app.services.stt_service import _new_job, get_stt_job_result, JobStatus
        jid = _new_job()
        result = get_stt_job_result(jid)
        assert result is not None
        assert result["status"] == JobStatus.QUEUED

    def test_unknown_job_returns_none(self):
        from app.services.stt_service import get_stt_job_result
        assert get_stt_job_result("nonexistent-uuid") is None


# ---------------------------------------------------------------------------
# Voice upload API: consent enforcement
# ---------------------------------------------------------------------------

class TestVoiceConsentEnforcement:
    """POST /api/voice/upload-audio must refuse without voice_processing consent."""

    def test_upload_without_consent_returns_403(self, client, candidate_token):
        headers = {"Authorization": f"Bearer {candidate_token}"}
        wav_magic = b"RIFF\x24\x00\x00\x00WAVE" + b"\x00" * 200
        files = {"file": ("test.wav", io.BytesIO(wav_magic), "audio/wav")}
        data = {"language": "en"}
        response = client.post("/api/v1/voice/upload-audio", headers=headers, files=files, data=data)
        # Should be 403 (no consent) not 503 (STT disabled) - consent check runs first
        assert response.status_code == 403
        assert "consent" in response.json()["detail"].lower()

    def test_upload_with_consent_but_stt_disabled_returns_503(self, client, candidate_token, db_session, candidate_user):
        from app.models.progress import ConsentLog
        # Grant voice_processing consent
        consent = ConsentLog(
            user_id=candidate_user.id,
            consent_type="voice_processing",
            consent_granted=True,
            consent_version="v1.0"
        )
        db_session.add(consent)
        db_session.commit()

        headers = {"Authorization": f"Bearer {candidate_token}"}
        wav_magic = b"RIFF\x24\x00\x00\x00WAVE" + b"\x00" * 200
        files = {"file": ("test.wav", io.BytesIO(wav_magic), "audio/wav")}
        data = {"language": "en"}
        response = client.post("/api/v1/voice/upload-audio", headers=headers, files=files, data=data)
        # STT is disabled by default in test env - should get 503
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# NOS completion and verification flow
# ---------------------------------------------------------------------------

class TestNosVerificationFlow:
    """Candidates self-report; training providers verify."""

    def _enroll_candidate(self, client, token):
        headers = {"Authorization": f"Bearer {token}"}
        resp = client.post(
            "/api/v1/profile/progress/enroll",
            json={"qp_code": "AMH/Q1947", "training_mode": "STT"},
            headers=headers
        )
        return resp

    def test_candidate_self_report_nos_as_pending(self, client, candidate_token):
        self._enroll_candidate(client, candidate_token)
        headers = {"Authorization": f"Bearer {candidate_token}"}
        resp = client.post(
            "/api/v1/profile/progress/complete-nos",
            json={"qp_code": "AMH/Q1947", "nos_code": "AMH/N0101", "hours_logged": 10},
            headers=headers
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert body["data"]["status"] == "pending_verification"

    def test_candidate_cannot_verify_nos(self, client, candidate_token):
        """Candidates do not have the training_provider role."""
        self._enroll_candidate(client, candidate_token)
        headers = {"Authorization": f"Bearer {candidate_token}"}
        resp = client.post(
            "/api/v1/profile/progress/verify-nos",
            json={
                "qp_code": "AMH/Q1947",
                "nos_code": "AMH/N0101",
                "candidate_user_id": 999
            },
            headers=headers
        )
        assert resp.status_code == 403

    def test_admin_can_verify_nos(self, client, admin_token, candidate_user, db_session):
        """Admin can verify an NOS completion for a candidate."""
        # Enroll candidate first using admin to create the record
        cand_resp = client.post(
            "/api/v1/auth/login",
            json={"email": candidate_user.email, "password": "CandidatePass123!"}
        )
        if cand_resp.status_code != 200:
            pytest.skip("Candidate login failed")
        cand_token = cand_resp.json()["data"]["access_token"]
        cand_headers = {"Authorization": f"Bearer {cand_token}"}
        client.post(
            "/api/v1/profile/progress/enroll",
            json={"qp_code": "AMH/Q1947", "training_mode": "STT"},
            headers=cand_headers
        )
        client.post(
            "/api/v1/profile/progress/complete-nos",
            json={"qp_code": "AMH/Q1947", "nos_code": "AMH/N0101", "hours_logged": 10},
            headers=cand_headers
        )

        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        resp = client.post(
            "/api/v1/profile/progress/verify-nos",
            json={
                "qp_code": "AMH/Q1947",
                "nos_code": "AMH/N0101",
                "candidate_user_id": candidate_user.id,
                "notes": "Verified in person"
            },
            headers=admin_headers
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True
        assert "AMH/N0101" in body["data"]["completed_nos_codes"]


# ---------------------------------------------------------------------------
# Admin analytics: no fake data
# ---------------------------------------------------------------------------

class TestAdminAnalyticsRealData:
    """Admin analytics must return is_empty_state when DB has no candidates."""

    def test_empty_db_returns_is_empty_state(self, client, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = client.get("/api/v1/admin/analytics", headers=headers)
        assert resp.status_code == 200
        data = resp.json()["data"]
        # In a fresh test DB (only our admin user, no candidates), is_empty_state should be True
        assert "is_empty_state" in data
        assert data["is_empty_state"] is True

    def test_kpis_are_real_not_inflated(self, client, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = client.get("/api/v1/admin/analytics", headers=headers)
        data = resp.json()["data"]
        # In test DB with no candidate users, total_candidates should be 0
        assert data["kpis"]["total_candidates"] == 0
        # And NOT the fake inflated value (1895)
        assert data["kpis"]["total_candidates"] != 1895

    def test_skill_demand_empty_when_no_skills(self, client, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = client.get("/api/v1/admin/analytics", headers=headers)
        data = resp.json()["data"]
        # With no skills in DB, skill_demand should be empty
        assert data["skill_demand"] == []

    def test_competency_gaps_not_fabricated(self, client, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}"}
        resp = client.get("/api/v1/admin/analytics", headers=headers)
        data = resp.json()["data"]
        # competency_gaps should be empty (not fabricated)
        assert data["competency_gaps"] == []


# ---------------------------------------------------------------------------
# Notification: 501 when no provider configured
# ---------------------------------------------------------------------------

class TestNotificationService:
    """Send-notification returns 501 when WHATSAPP_PROVIDER / SMS_PROVIDER not set."""

    def test_whatsapp_notification_501_when_unconfigured(self, client, candidate_token):
        headers = {"Authorization": f"Bearer {candidate_token}"}
        payload = {
            "phone": "+919876543210",
            "channel": "whatsapp",
            "qp_code": "AMH/Q1947",
            "qp_name": "Self Employed Tailor",
            "language": "en"
        }
        resp = client.post("/api/v1/voice/send-notification", json=payload, headers=headers)
        assert resp.status_code == 501
        assert "WHATSAPP" in resp.json()["detail"]

    def test_sms_notification_501_when_unconfigured(self, client, candidate_token):
        headers = {"Authorization": f"Bearer {candidate_token}"}
        payload = {
            "phone": "+919876543210",
            "channel": "sms",
            "qp_code": "AMH/Q1947",
            "qp_name": "Self Employed Tailor",
            "language": "en"
        }
        resp = client.post("/api/v1/voice/send-notification", json=payload, headers=headers)
        assert resp.status_code == 501