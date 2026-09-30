def test_nsqf_catalog_count(client):
    response = client.get("/api/v1/competencies/occupations")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 30, f"Expected at least 30 QPs, found {len(data)}"


def test_canonical_taxonomy(client):
    response = client.get("/api/v1/competencies/taxonomy")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 15


def test_recommendation_ranking(client):
    payload = {
        "education": "12th Standard",
        "prior_occupation": "Tailoring & Dressmaking",
        "experience_years": 2.5,
        "livelihood_goal": "self-employment",
        "skills": ["Basic Machine Stitching", "Fabric Cutting & Marking"],
        "resources": ["Sewing Machine"],
        "constraints": ["cannot_travel_far"]
    }
    response = client.post("/api/v1/recommendations/rank", json=payload)
    assert response.status_code == 200
    recs = response.json()["data"]
    assert len(recs) > 0
    top = recs[0]
    assert "match_score" in top
    assert "score_breakdown" in top
    assert "estimated_bridge_hours" in top
    assert top["match_score"] > 50.0


def test_competency_gap_analysis(client):
    payload = {
        "qp_code": "AMH/Q1947",
        "skills": ["Basic Machine Stitching"]
    }
    response = client.post("/api/v1/competencies/gap-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "missing_count" in data
    assert "matched_count" in data
    assert "estimated_bridge_hours" in data
    assert data["estimated_bridge_hours"] > 0


def test_dynamic_roadmap(client):
    response = client.get("/api/v1/pathways/roadmap/AMH/Q1947?experience_years=2.0&livelihood_goal=self-employment")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "stages" in data
    assert len(data["stages"]) >= 3
    assert data["training_mode"] in ("RPL", "STT")


def test_schemes_eligibility(client):
    payload = {
        "prior_occupation": "Tailoring / Apparel Stitching",
        "experience_years": 2.0,
        "livelihood_goal": "self-employment",
        "resources": ["Sewing Machine"]
    }
    response = client.post("/api/v1/recommendations/scheme-eligibility", json=payload)
    assert response.status_code == 200
    schemes = response.json()["data"]
    assert isinstance(schemes, list)
    assert len(schemes) > 0
    assert any(s["scheme_code"] == "PM_VISHWAKARMA" for s in schemes)


def test_conversational_followup_tamil(client, candidate_token):
    headers = {"Authorization": f"Bearer {candidate_token}"}
    payload = {
        "unresolved_fields": ["education", "experience_years"],
        "language": "ta"
    }
    response = client.post("/api/v1/voice/conversational-followup", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data["followup_questions"]) == 2
    assert "கல்வித் தகுதி" in data["followup_questions"][0]["question"]


def test_unauthenticated_voice_process_session_tamil(client):
    """Verify that unauthenticated candidates can complete voice assessment without getting 401."""
    payload = {
        "language": "ta",
        "full_transcript": "நான் 10ஆம் வகுப்பு முடித்துள்ளேன். 1.5 ஆண்டுகள் மின்சார வயரிங் வேலை செய்துள்ளேன். எலக்ட்ரீசியன் ஆக விரும்புகிறேன்.",
        "answers": [
            {
                "question_id": 1,
                "question_key": "education",
                "user_transcript": "10-ஆம் வகுப்பு"
            },
            {
                "question_id": 2,
                "question_key": "skills",
                "user_transcript": "மின்சார வேலை மற்றும் வயரிங்"
            }
        ]
    }
    # Notice: NO Authorization header is sent!
    response = client.post("/api/v1/voice/process-session", json=payload)
    assert response.status_code == 200, f"Expected 200 OK without auth, got {response.status_code}: {response.text}"
    result = response.json()["data"]
    assert result["status"] == "success"
    assert result["recommended_role"] is not None
    assert result["match_score"] > 50
    # Must provide suitability explanation and development roadmap in Tamil
    assert "பொருத்தமான" in result["suitability_explanation"] or "தொழில்" in result["suitability_explanation"]
    assert len(result["development_roadmap"]) >= 3
    assert len(result["skills_to_develop"]) > 0


def test_unauthenticated_voice_process_session_hindi(client):
    """Verify that Hindi voice assessment returns tailored Hindi guidance and roadmap."""
    payload = {
        "language": "hi",
        "full_transcript": "मैंने 10वीं पास की है और 2 साल से सिलाई का काम कर रहा हूँ। खुद का टेलरिंग बुटीक शुरू करना चाहता हूँ।",
        "answers": [
            {
                "question_id": 1,
                "question_key": "skills",
                "user_transcript": "सिलाई और कपड़े की कटाई"
            }
        ]
    }
    response = client.post("/api/v1/voice/process-session", json=payload)
    assert response.status_code == 200
    result = response.json()["data"]
    assert result["status"] == "success"
    assert result["recommended_role"] is not None
    assert "आजीविका" in result["suitability_explanation"] or "कौशल" in result["suitability_explanation"]
    assert len(result["development_roadmap"]) >= 3

