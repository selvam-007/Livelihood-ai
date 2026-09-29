from app.models.user import User
from app.services.security import verify_password


def test_register_candidate(client):
    payload = {
        "email": "new_artisan@livelihood.ai",
        "password": "ArtisanPassword123!",
        "full_name": "Kavitha Sundaram",
        "role": "candidate",
        "preferred_language": "ta",
        "location": "Coimbatore, Tamil Nadu"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert body["data"]["user"]["email"] == "new_artisan@livelihood.ai"
    assert body["data"]["user"]["role"] == "candidate"


def test_register_duplicate_email(client, candidate_user):
    payload = {
        "email": candidate_user.email,
        "password": "AnotherPassword123!",
        "full_name": "Duplicate User",
        "role": "candidate"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client, candidate_user):
    payload = {
        "email": candidate_user.email,
        "password": "CandidatePass123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert body["data"]["token_type"] == "bearer"


def test_login_invalid_password(client, candidate_user):
    payload = {
        "email": candidate_user.email,
        "password": "WrongPassword123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_profile(client, candidate_token):
    headers = {"Authorization": f"Bearer {candidate_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["email"] == "test_candidate@livelihood.ai"


def test_get_current_user_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_seed_demo_users_endpoint(client):
    response = client.post("/api/v1/auth/seed-demo-users")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "seeded_emails" in body["data"]
    assert "candidate@livelihood.ai" in body["data"]["seeded_emails"]
