import io
from fastapi.testclient import TestClient
from app.main import app
from app.ai.profile_extraction.extractor import extract_structured_profile
from app.ai.skill_extraction.skill_normalizer import extract_and_normalize_skills

client = TestClient(app)

print("=== TESTING NEWLY IMPLEMENTED ENHANCEMENTS ===")

# Test 1: Dual-engine extraction on conversational story input
print("\n[TEST 1] Dual-Engine LLM/Semantic Fallback Extraction:")
text_sample = "நான் 12 ஆம் வகுப்பு முடித்து 2 வருடங்கள் தையல் வேலை செய்தேன். வீட்டில் தையல் மிஷின் உள்ளது. சொந்தமாக தொழில் செய்ய வேண்டும்."
profile, unresolved = extract_structured_profile(text_sample)
print(f" -> Extracted Occupation: {profile.prior_occupation}")
print(f" -> Education: {profile.education}")
print(f" -> Experience: {profile.experience_years} years")
print(f" -> Goal: {profile.livelihood_goal}")
print(f" -> Resources: {profile.resources}")
assert profile.prior_occupation == "Tailoring / Apparel Stitching"
assert profile.education == "12th Standard"
print(" [PASS] Dual-Engine Extraction Verified.")

# Test 2: Audio File Upload endpoint
print("\n[TEST 2] Audio File Upload & Auto-Profile Processing:")
dummy_audio_bytes = b"RIFF....WAVEfmt ...."
files = {"file": ("tailor_voice_memo.wav", io.BytesIO(dummy_audio_bytes), "audio/wav")}
data = {"language": "ta"}
resp = client.post("/api/voice/upload-audio", files=files, data=data)
print(f" -> Status: {resp.status_code}")
res_json = resp.json()
print(f" -> Success: {res_json.get('success')}")
print(f" -> Transcribed Text: {res_json['data']['transcribed_text'][:50]}...")
print(f" -> Detected Profile: {res_json['data']['profile']['prior_occupation']}")
assert resp.status_code == 200
assert res_json.get("success") is True
print(" [PASS] Audio Upload & Auto-Processing Verified.")

# Test 3: Recommendation ranking
print("\n[TEST 3] NSQF Recommendation Ranking:")
rec_resp = client.post("/api/recommendations/rank", json={
    "skills": ["Basic Machine Stitching", "Fabric Cutting & Marking"],
    "education": "12th Standard",
    "experience_years": 2.0,
    "livelihood_goal": "self-employment",
    "resources": ["Sewing machine"]
})
print(f" -> Status: {rec_resp.status_code}")
rec_data = rec_resp.json()
print(f" -> Top Recommendation: {rec_data['data'][0]['qualification_name']} (Match: {rec_data['data'][0]['match_score']}%)")
assert rec_resp.status_code == 200
print(" [PASS] NSQF Recommendation Engine Verified.")

# Test 4: Health Check
print("\n[TEST 4] Health Check:")
health = client.get("/api/health")
print(f" -> Health Status: {health.json()}")
assert health.status_code == 200

print("\n=== ALL ENHANCEMENT AUDITS PASSED 100% ===")
