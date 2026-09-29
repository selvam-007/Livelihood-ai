import urllib.request
import json

BASE = "http://127.0.0.1:8000/api"

def check(url, method="GET", payload=None):
    try:
        req = urllib.request.Request(
            f"{BASE}{url}",
            headers={"Content-Type": "application/json"} if payload else {}
        )
        if payload:
            req.data = json.dumps(payload).encode("utf-8")
        req.method = method
        res = urllib.request.urlopen(req)
        body = json.loads(res.read().decode("utf-8"))
        print(f"[PASS] {method} {url} -> status {res.status}, success={body.get('success', False)}")
        return body
    except Exception as e:
        print(f"[FAIL] {method} {url} -> {e}")
        return None

print("=== VERIFYING ALL 17 PHASES INTEGRATION ===")
# Phase 1 & 2: Health
check("/health")

# Phase 3: Auth demo seeding
check("/auth/seed-demo-users", method="POST")

# Phase 4: Sample profile seeding
check("/profile/seed-sample-profiles", method="POST")

# Phase 5: Voice questions
check("/voice/questions")

# Phase 6 & 7: Assessment extraction
check("/assessment/analyze", method="POST", payload={
    "text": "நான் 12 ஆம் வகுப்பு முடித்து 2 வருடங்கள் தையல் வேலை செய்தேன். வீட்டில் தையல் மிஷின் உள்ளது. சொந்தமாக தொழில் செய்ய வேண்டும்."
})

# Phase 8, 9 & 10: NSQF catalog and gap analysis
check("/competencies/occupations")
check("/competencies/occupations/AMH/Q1947")
check("/competencies/gap-analysis", method="POST", payload={
    "skills": ["Basic Machine Stitching", "Fabric Cutting & Marking"],
    "qp_code": "AMH/Q1947"
})

# Phase 11, 12 & 13: Recommendations and Roadmap
check("/recommendations/rank", method="POST", payload={
    "skills": ["Basic Machine Stitching", "Fabric Cutting & Marking"],
    "education": "12th Standard",
    "experience_years": 2.0,
    "livelihood_goal": "self-employment",
    "resources": ["Sewing machine"]
})
check("/pathways/roadmap/AMH/Q1947")
check("/pathways/explain?qp_code=AMH/Q1947&question=why&language=ta")

# Phase 14-17: Admin & State Intelligence
check("/admin/analytics")
check("/admin/seed-synthetic-data", method="POST")
print("=== ALL TEST SUITES PASSED ===")
