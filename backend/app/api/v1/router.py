from fastapi import APIRouter

from app.api.v1.analyses import router as analyses_router
from app.api.v1.auth import router as auth_router
from app.api.v1.models import router as models_router
from app.api.v1.upload import router as upload_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(upload_router)
api_router.include_router(models_router)
api_router.include_router(analyses_router)
