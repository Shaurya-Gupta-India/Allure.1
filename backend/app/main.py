from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "ALLURE backend API for authenticated image uploads, private analysis history, "
        "pluggable face/hair/skin model inference, and cosmetic recommendations. "
        "Analysis results are not medical diagnoses."
    ),
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["System"])
async def root():
    return {"application": "ALLURE", "message": "Welcome to ALLURE API", "status": "running"}


@app.get("/health", tags=["System"])
async def health_check():
    from app.ml.registry import model_status
    return {
        "status": "healthy",
        "application": "ALLURE",
        "version": settings.APP_VERSION,
        "supabase_configured": settings.supabase_configured,
        "models": model_status(),
    }
