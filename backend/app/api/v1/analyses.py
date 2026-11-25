from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_access_token, get_current_user
from app.db.supabase_rest import (
    SupabaseNotConfigured, SupabaseRequestError, list_analyses,
)
from app.ml.registry import ModelPipelineError, ModelsNotConfigured, model_status
from app.schemas.api import AnalysisListItem, AnalysisResponse, CreateAnalysisRequest, DeleteResponse
from app.services.analysis_service import (
    delete_analysis_for_user, get_analysis_for_user, run_saved_analysis,
    start_analysis, to_analysis_response,
)

router = APIRouter(prefix="/analyses", tags=["Skin Analysis"])


def _handle_supabase_error(exc: Exception) -> HTTPException:
    if isinstance(exc, SupabaseNotConfigured):
        return HTTPException(status_code=503, detail=str(exc))
    if isinstance(exc, SupabaseRequestError):
        return HTTPException(status_code=exc.status_code, detail=exc.details or str(exc))
    return HTTPException(status_code=502, detail="A database or storage operation failed.")


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(
    payload: CreateAnalysisRequest,
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    if not payload.consent_to_analysis:
        raise HTTPException(status_code=400, detail="Confirm consent_to_analysis=true before processing the image.")
    try:
        row = await start_analysis(str(current_user["id"]), payload.image_path, access_token)
        if row.get("status") == "completed":
            message = "Analysis is complete."
        elif row.get("status") == "failed":
            message = "Analysis could not be completed. Review error_message and check the model adapter."
        else:
            message = "Analysis is saved and waiting for your face, hair, and skin models to be connected. No predictions have been generated."
        return await to_analysis_response(row, access_token, message)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (SupabaseNotConfigured, SupabaseRequestError) as exc:
        raise _handle_supabase_error(exc) from exc
    except ModelPipelineError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("", response_model=list[AnalysisListItem])
async def get_analysis_history(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    try:
        return await list_analyses(access_token, limit)
    except (SupabaseNotConfigured, SupabaseRequestError) as exc:
        raise _handle_supabase_error(exc) from exc


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: UUID,
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    try:
        row = await get_analysis_for_user(str(analysis_id), access_token)
        if not row:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        return await to_analysis_response(row, access_token)
    except (SupabaseNotConfigured, SupabaseRequestError) as exc:
        raise _handle_supabase_error(exc) from exc


@router.post("/{analysis_id}/run", response_model=AnalysisResponse)
async def run_analysis_again(
    analysis_id: UUID,
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    try:
        row = await get_analysis_for_user(str(analysis_id), access_token)
        if not row:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        status_data = model_status()
        if not status_data["ready"]:
            raise HTTPException(status_code=409, detail=status_data["message"])
        try:
            updated = await run_saved_analysis(row, access_token)
        except ModelPipelineError:
            updated = await get_analysis_for_user(str(analysis_id), access_token) or row
        return await to_analysis_response(updated, access_token, "Analysis processing finished." if updated.get("status") == "completed" else "Analysis did not complete.")
    except (SupabaseNotConfigured, SupabaseRequestError) as exc:
        raise _handle_supabase_error(exc) from exc
    except ModelsNotConfigured as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete("/{analysis_id}", response_model=DeleteResponse)
async def remove_analysis(
    analysis_id: UUID,
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    try:
        row = await get_analysis_for_user(str(analysis_id), access_token)
        if not row:
            raise HTTPException(status_code=404, detail="Analysis not found.")
        await delete_analysis_for_user(row, access_token)
        return {"success": True, "message": "Analysis and its stored image were deleted."}
    except (SupabaseNotConfigured, SupabaseRequestError) as exc:
        raise _handle_supabase_error(exc) from exc
