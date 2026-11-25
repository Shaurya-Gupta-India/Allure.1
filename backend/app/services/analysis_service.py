from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.db.supabase_rest import (
    SupabaseRequestError, create_signed_url, delete_analysis, delete_object,
    download_object, get_analysis, insert_analysis, update_analysis,
)
from app.ml.registry import ModelPipelineError, ModelsNotConfigured, run_model_pipeline
from app.schemas.api import AnalysisResponse, Finding, ModelAnalysisOutput, Recommendation
from app.services.recommendation_service import build_recommendations


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ensure_owned_path(user_id: str, image_path: str) -> None:
    if not image_path.startswith(f"{user_id}/") or ".." in image_path.split("/"):
        raise ValueError("image_path must refer to an image uploaded by the signed-in user.")


async def start_analysis(user_id: str, image_path: str, access_token: str) -> dict[str, Any]:
    _ensure_owned_path(user_id, image_path)
    try:
        row = await insert_analysis({
            "user_id": user_id,
            "image_path": image_path,
            "status": "awaiting_models",
            "findings": [],
            "recommendations": [],
            "model_version": None,
        }, access_token)
    except SupabaseRequestError:
        raise

    from app.ml.registry import model_status
    status = model_status()
    if status["ready"]:
        try:
            return await run_saved_analysis(row, access_token)
        except ModelPipelineError:
            # The failed state and safe error message have already been persisted.
            return await get_analysis(str(row["id"]), access_token) or row
    return row


async def run_saved_analysis(row: dict[str, Any], access_token: str) -> dict[str, Any]:
    analysis_id = str(row["id"])
    path = row["image_path"]
    try:
        await update_analysis(analysis_id, {"status": "processing", "error_message": None, "updated_at": _now()}, access_token)
        image_bytes = await download_object(settings.STORAGE_BUCKET, path, access_token)
        output: ModelAnalysisOutput = await run_in_threadpool(run_model_pipeline, image_bytes)
        recommendations: list[Recommendation] = build_recommendations(output.findings)
        return await update_analysis(analysis_id, {
            "status": "completed",
            "findings": [finding.model_dump() for finding in output.findings],
            "recommendations": [item.model_dump() for item in recommendations],
            "model_version": output.model_version,
            "error_message": None,
            "updated_at": _now(),
        }, access_token) or row
    except ModelsNotConfigured:
        return await update_analysis(analysis_id, {"status": "awaiting_models", "updated_at": _now()}, access_token) or row
    except ModelPipelineError as exc:
        await update_analysis(analysis_id, {"status": "failed", "error_message": str(exc), "updated_at": _now()}, access_token)
        raise


async def get_analysis_for_user(analysis_id: str, access_token: str) -> dict[str, Any] | None:
    return await get_analysis(analysis_id, access_token)


async def delete_analysis_for_user(row: dict[str, Any], access_token: str) -> None:
    # Delete the private object first; if this fails the DB record is retained.
    await delete_object(settings.STORAGE_BUCKET, row["image_path"], access_token)
    await delete_analysis(str(row["id"]), access_token)


async def to_analysis_response(row: dict[str, Any], access_token: str, message: str | None = None) -> dict[str, Any]:
    image_url = None
    if row.get("image_path"):
        try:
            image_url = await create_signed_url(
                settings.STORAGE_BUCKET,
                row["image_path"],
                access_token,
                settings.SIGNED_URL_TTL_SECONDS,
            )
        except SupabaseRequestError:
            # The analysis remains retrievable even if a temporary image URL fails.
            image_url = None
    return {
        "id": row["id"],
        "status": row["status"],
        "image_path": row["image_path"],
        "image_url": image_url,
        "findings": row.get("findings") or [],
        "recommendations": row.get("recommendations") or [],
        "model_version": row.get("model_version"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
        "message": message,
        "error_message": row.get("error_message"),
    }
