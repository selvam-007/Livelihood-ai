import json
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import engine
from app.database.base import Base

# Ensure tables created
Base.metadata.create_all(bind=engine)

client = TestClient(app)

print("=================================================================")
print("RUNNING COMPREHENSIVE ROADMAP IMPROVEMENTS AUDIT")
print("=================================================================")

# 1. NSQF Catalog Verification (30+ Verified QPs)
print("\n[1] Verified NSQF Catalog:")
resp = client.get("/api/competencies/occupations")
assert resp.status_code == 200
data = resp.json()["data"]
print(f" -> Total Verified QPs in Catalog: {len(data)}")
assert len(data) >= 30, f"Expected at least 30 QPs, got {len(data)}"
print(" [PASS] 30+ Verified NSQF QPs Catalog Active.")

# 2. Canonical Skill Taxonomy
print("\n[2] Canonical Skill Taxonomy:")
resp = client.get("/api/competencies/taxonomy")
assert resp.status_code == 200
tax_data = resp.json()["data"]
print(f" -> Total Canonical Taxonomy Nodes: {len(tax_data)}")
assert len(tax_data) >= 15
print(" [PASS] Canonical Skill Taxonomy Mapped.")

# 3. Honest Recommendation Scoring with Explainability & Constraints
print("\n[3] Recommendation Engine with Honest Scoring & Explainability:")
rank_payload = {
    "education": "12th Standard",
    "prior_occupation": "Tailoring & Dressmaking",
    "experience_years": 2.5,
    "livelihood_goal": "self-employment",
    "skills": ["Basic Machine Stitching", "Fabric Cutting & Marking"],
    "resources": ["Sewing Machine"],
    "constraints": ["cannot_travel_far"]
}
resp = client.post("/api/recommendations/rank", json=rank_payload)
assert resp.status_code == 200
recs = resp.json()["data"]
top_rec = recs[0]
print(f" -> Top Recommendation: {top_rec['qualification_name']} ({top_rec['qp_code']})")
print(f" -> Honest Match Score: {top_rec['match_score']}% ({top_rec['confidence_band']})")
print(f" -> Score Breakdown: {top_rec['score_breakdown']}")
print(f" -> Bridge Hours Estimate: {top_rec.get('estimated_bridge_hours')}h ({top_rec.get('recommended_training_mode')})")
print(f" -> Explainability Rationale: {top_rec.get('why_recommended')}")
assert top_rec["match_score"] > 60.0
assert "skills_score" in top_rec["score_breakdown"]
print(" [PASS] Honest Recommendation Scoring Verified.")

# 4. Competency Gap Analysis with Bridge Hours
print("\n[4] Competency Gap Analysis & Bridge Hours:")
gap_payload = {
    "skills": ["Basic Machine Stitching"],
    "qp_code": "AMH/Q1947"
}
resp = client.post("/api/competencies/gap-analysis", json=gap_payload)
assert resp.status_code == 200
gap_data = resp.json()["data"]
print(f" -> Target QP: {gap_data['target_qualification_name']}")
print(f" -> Gaps Identified: {gap_data['missing_count']} missing, {gap_data['matched_count']} matched")
print(f" -> Recommended Training Mode: {gap_data.get('recommended_training_mode')}")
print(f" -> Estimated Bridge Training Hours: {gap_data.get('estimated_bridge_hours')} Hours")
assert gap_data["estimated_bridge_hours"] > 0
print(" [PASS] Gap Analysis & Bridge Hours Calculation Verified.")

# 5. Dynamic Roadmap Generation
print("\n[5] Dynamic Roadmap Generation:")
resp = client.get("/api/pathways/roadmap/AMH/Q1947?experience_years=2.0&livelihood_goal=self-employment")
assert resp.status_code == 200
roadmap_data = resp.json()["data"]
print(f" -> Training Mode: {roadmap_data.get('training_mode')}")
print(f" -> Dynamic Stages Count: {len(roadmap_data['stages'])}")
for stage in roadmap_data['stages']:
    print(f"    Stage {stage['stage_number']}: {stage['stage_name']} ({stage['status']})")
assert len(roadmap_data["stages"]) == 5
print(" [PASS] Dynamic Roadmap Generation Verified.")

# 6. Training Centre Locator with Distance Filter
print("\n[6] Training Centre Directory & GPS Distance Filter:")
# Search near Chennai (lat 13.08, lon 80.27) within 50 km
resp = client.get("/api/competencies/centres?user_lat=13.0827&user_lon=80.2707&max_distance_km=50")
assert resp.status_code == 200
centres = resp.json()["data"]
print(f" -> Centres within 50km of Chennai: {len(centres)}")
for c in centres:
    print(f"    - {c['name']} ({c['district']}): {c.get('distance_km')} km away, {c['available_seats']} seats")
assert len(centres) >= 1
print(" [PASS] Training Centre Directory & Distance Filter Verified.")

# 7. Government Scheme Eligibility Engine
print("\n[7] Government Scheme Eligibility Rules Engine:")
scheme_payload = {
    "education": "8th Standard",
    "prior_occupation": "tailor",
    "experience_years": 2.0,
    "livelihood_goal": "self-employment",
    "target_qp_code": "AMH/Q1947"
}
resp = client.post("/api/recommendations/scheme-eligibility", json=scheme_payload)
assert resp.status_code == 200
schemes = resp.json()["data"]
print(f" -> Evaluated Government Schemes: {len(schemes)}")
for s in schemes:
    print(f"    - {s['name']}: Eligible={s['is_eligible']} ({s.get('stipend_reward', '')[:50]}...)")
assert any(s["scheme_code"] == "PM_VISHWAKARMA" for s in schemes)
assert any(s["scheme_code"] == "PMKVY_RPL" for s in schemes)
print(" [PASS] Scheme Eligibility Rules Engine Verified.")

# 8. Conversational Follow-Up Questions
print("\n[8] Conversational Follow-up Generator:")
followup_payload = {
    "unresolved_fields": ["education", "experience_years"],
    "language": "ta"
}
resp = client.post("/api/voice/conversational-followup", json=followup_payload)
assert resp.status_code == 200
f_data = resp.json()["data"]
print(f" -> Language: {f_data['language']}")
for q in f_data["followup_questions"]:
    print(f"    - {q['field']}: {q['question']}")
assert len(f_data["followup_questions"]) == 2
print(" [PASS] Vernacular Conversational Follow-ups Verified.")

# 9. SMS / WhatsApp Notification Simulator
print("\n[9] SMS / WhatsApp Notification Simulator:")
notify_payload = {
    "phone": "+91 98765 43210",
    "channel": "whatsapp",
    "qp_code": "AMH/Q1947",
    "qp_name": "Self Employed Tailor",
    "centre_name": "PMKK Skill Center Guindy",
    "centre_phone": "+91 94440 12345",
    "language": "ta"
}
resp = client.post("/api/voice/send-notification-simulation", json=notify_payload)
assert resp.status_code == 200
n_data = resp.json()["data"]
print(f" -> Channel: {n_data['channel']}")
print(f" -> Simulated Message Body: {n_data['message_body']}")
assert n_data["delivery_status"] == "SENT_VIA_GATEWAY"
print(" [PASS] Notification Simulator Verified.")

# 10. API Versioning & Security Middleware
print("\n[10] API Versioning & Structured Middleware:")
v1_resp = client.get("/api/v1/health")
assert v1_resp.status_code == 200
assert "X-Process-Time" in v1_resp.headers
print(f" -> /api/v1/health status: {v1_resp.status_code}, Latency: {v1_resp.headers.get('X-Process-Time')}")
print(" [PASS] API v1 Versioning & Middleware Verified.")

print("\n=================================================================")
print("ALL 10 ROADMAP BACKEND AUDITS PASSED WITH 100% SUCCESS!")
print("=================================================================")
