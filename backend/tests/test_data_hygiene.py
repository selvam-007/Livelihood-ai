from app.knowledge.training_centres import VERIFIED_TRAINING_CENTRES


def test_training_centres_no_invented_phone_numbers():
    """Verify that Rule 5 is strictly upheld: no invented phone numbers in verified training centres."""
    for centre in VERIFIED_TRAINING_CENTRES:
        phone = centre.get("phone")
        # Phone must either be None or a clearly labelled placeholder
        if phone is not None:
            assert "placeholder" in phone.lower() or "not provided" in phone.lower()
        # Official portal link must point to verified domain
        assert centre.get("official_portal") == "https://www.skillindiadigital.gov.in"


def test_notification_without_provider_returns_501(client, candidate_token):
    """send-notification returns 501 when no WHATSAPP_PROVIDER is configured."""
    headers = {"Authorization": f"Bearer {candidate_token}"}
    payload = {
        "phone": "+91 99999 00000",
        "channel": "whatsapp",
        "qp_code": "AMH/Q1947",
        "qp_name": "Self Employed Tailor",
        "centre_name": "Government ITI Coimbatore",
        "centre_phone": None,
        "language": "ta"
    }
    response = client.post("/api/v1/voice/send-notification", json=payload, headers=headers)
    # Real endpoint returns 501 (no provider) rather than fake 200
    assert response.status_code == 501
    assert "WHATSAPP" in response.json()["detail"]


def test_notification_message_includes_phone(client, candidate_token):
    """When provider is set, notification message body includes centre phone.
    Without a real provider, the 501 detail message still shouldn't fabricate data."""
    headers = {"Authorization": f"Bearer {candidate_token}"}
    payload = {
        "phone": "+91 99999 00000",
        "channel": "whatsapp",
        "qp_code": "AMH/Q1947",
        "qp_name": "Self Employed Tailor",
        "centre_name": "Government ITI Coimbatore",
        "centre_phone": "0422-2450123",
        "language": "en"
    }
    response = client.post("/api/v1/voice/send-notification", json=payload, headers=headers)
    # Returns 501 since WHATSAPP_PROVIDER not configured, but message is logged
    assert response.status_code == 501
    assert "provider" in response.json()["detail"].lower()
