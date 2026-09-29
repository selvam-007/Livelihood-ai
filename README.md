# LivelihoodAI (SkillPath AI)

> AI-Powered Voice-First Livelihood Intelligence & NSQF Skilling Platform

LivelihoodAI is an AI-driven, voice-first livelihood enablement platform aligned with India's National Skills Qualifications Framework (NSQF). It extracts candidate competencies from conversational vernacular speech (English, Tamil, Hindi, Telugu, Kannada), identifies skill gaps, recommends verified qualification packs, maps dynamic skilling roadmaps, checks government scheme eligibility, and locates accredited training centres.

---

## Architecture & Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic v2, SQLite (dev) / PostgreSQL (prod), Bcrypt, Python-JOSE (JWT)
- **Frontend**: React 19, Vite, TailwindCSS, Lucide Icons, Recharts
- **AI & NLP**: Multi-engine skill extractor (Google Gemini 1.5 Flash with fallback vernacular semantic rule engine)
- **Voice Pipeline**: Bhashini / Whisper audio upload pipeline & Web Speech API

---

## Security Notes

1. **Role-Based Access Control (RBAC) & Privilege Separation**
   - **Self-Registration Constraint**: `/api/auth/register` strictly provisions users with `role="candidate"`. Clients cannot self-elevate to `role="admin"`.
   - **Administrative Provisioning**: Dedicated administrative endpoints (`/api/auth/create-admin`, `/api/auth/promote-admin`, `/api/admin/*`, and `/api/profile/seed-sample-profiles`) are strictly guarded by the `require_admin` dependency.
   - **Password Security**: Passwords enforce a minimum of 8 characters and are hashed using bcrypt with salt rounds.

2. **Horizontal Authorization & Profile Ownership (IDOR Prevention)**
   - Candidate profile inspection (`GET /api/profile/{profile_id}`) enforces strict tenant boundaries: candidates may only view their own profile records (`profile.user_id == current_user.id`). Unauthorized requests return `403 Forbidden`. Only verified administrators may view other profiles.
   - Dynamic parameter routes are ordered after all static routes (e.g. `/progress`, `/consent`, `/feedback`) to prevent route shadowing.

3. **Secret & Key Management**
   - No hardcoded secrets, passwords, or tokens exist in code.
   - In `ENVIRONMENT=production`, `SECRET_KEY` is mandatory via environment variable with no default. Insecure or default markers trigger a fatal startup validation failure.
   - Google Gemini API keys are transmitted securely via the `x-goog-api-key` HTTP header rather than in URL query parameters, preventing leakage into web proxy and access logs.

4. **Environment-Specific Hardening**
   - `DEBUG` defaults to `false`.
   - In production environments, Swagger UI (`/docs`) and ReDoc (`/redoc`) are completely disabled.
   - Demo and synthetic data seeding endpoints (`/api/auth/seed-demo-users`, `/api/profile/seed-sample-profiles`, `/api/admin/seed-synthetic-data`) are disabled in production (`403 Forbidden`).

5. **Voice Endpoint Protection**
   - All voice assessment and transcription routes under `/api/voice/*` are guarded by `get_current_user`, returning `401 Unauthorized` for unauthenticated requests.

6. **Unified Client Auth & Session Lifecycle**
   - Frontend uses a single standardized token storage key (`livelihood_token`).
   - Every outbound API request passes through the unified `apiClient` singleton.
   - On encountering any `401 Unauthorized` response, `apiClient` automatically evicts stored session tokens and triggers an `auth:unauthorized` event to log the user out and display the authentication modal.

7. **Data Hygiene & Truthfulness (Rule 5)**
   - No real-world contact numbers, fictitious names, or fabricated certificate URLs on government domains are invented. Missing contact details display empty states or direct links to official portals (e.g. Skill India Digital).

---

## Local Development Setup

### Backend
```bash
cd backend
python -m venv ../venv
../venv/Scripts/pip install -r requirements.txt
../venv/Scripts/python -m pytest tests/
../venv/Scripts/python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run dev
```
