from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.voice import router as voice_router
from app.api.assessment import router as assessment_router
from app.api.competencies import router as competencies_router
from app.api.recommendations import router as recommendations_router
from app.api.pathways import router as pathways_router
from app.api.admin import router as admin_router
from app.api.catalog import router as catalog_router
from app.api.agent import router as agent_router
from app.api.provider import router as provider_router
from app.api.counselor import router as counselor_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(voice_router)
api_router.include_router(assessment_router)
api_router.include_router(competencies_router)
api_router.include_router(recommendations_router)
api_router.include_router(pathways_router)
api_router.include_router(admin_router)
api_router.include_router(catalog_router)
api_router.include_router(agent_router)
api_router.include_router(provider_router)
api_router.include_router(counselor_router)