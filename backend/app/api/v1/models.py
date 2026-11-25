from fastapi import APIRouter, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool

from app.ml.registry import model_status, run_model_pipeline
from app.schemas.api import ModelStatusResponse
from app.services.groq_service import generate_grooming_explanation

router = APIRouter(tags=["ML Models"])


@router.get("/models/status", response_model=ModelStatusResponse)
async def get_model_status():
    return model_status()


@router.post("/models/analyze-direct")
async def analyze_direct(file: UploadFile = File(...)):
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    # 1. Run Face Detection + Model 1 (Face Shape) + Model 2 (Hair Texture)
    result = await run_in_threadpool(run_model_pipeline, image_bytes)
    findings = [f.model_dump() for f in result.findings]
    face_detected = any(f["domain"] == "face" for f in findings)

    # 2. Send ML findings to Groq LLM for a simple explanation
    explanation = await run_in_threadpool(generate_grooming_explanation, findings)

    return {
        "face_detected": face_detected,
        "model_version": result.model_version,
        "findings": findings,
        "ai_explanation": explanation,
    }
