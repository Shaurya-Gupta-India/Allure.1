from __future__ import annotations


from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.security import get_access_token, get_current_user
from app.db.supabase_rest import SupabaseNotConfigured, SupabaseRequestError
from app.schemas.api import UploadResponse
from app.services.image_service import validate_image
from app.services.storage_service import image_signed_url, new_image_path, store_image

router = APIRouter(tags=["Image Upload"])


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    access_token: str = Depends(get_access_token),
):
    image_bytes = await file.read(settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024 + 1)
    try:
        content_type, width, height = validate_image(image_bytes, file.content_type)
        path, file_name = new_image_path(str(current_user["id"]), content_type)
        await store_image(image_bytes, path, content_type, access_token)
        image_url = await image_signed_url(path, access_token)
        return {
            "success": True,
            "message": "Image uploaded successfully.",
            "data": {
                "bucket": settings.STORAGE_BUCKET,
                "path": path,
                "file_name": file_name,
                "size_bytes": len(image_bytes),
                "width": width,
                "height": height,
                "content_type": content_type,
                "image_url": image_url,
            },
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SupabaseNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SupabaseRequestError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.details or str(exc)) from exc
    finally:
        await file.close()
