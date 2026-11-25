from __future__ import annotations

import uuid

from app.core.config import settings
from app.db.supabase_rest import upload_object, create_signed_url, delete_object


def new_image_path(user_id: str, content_type: str) -> tuple[str, str]:
    extension = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}[content_type]
    file_name = f"{uuid.uuid4()}.{extension}"
    return f"{user_id}/{file_name}", file_name


async def store_image(data: bytes, path: str, content_type: str, access_token: str) -> None:
    await upload_object(settings.STORAGE_BUCKET, path, data, content_type, access_token)


async def image_signed_url(path: str, access_token: str) -> str:
    return await create_signed_url(settings.STORAGE_BUCKET, path, access_token, settings.SIGNED_URL_TTL_SECONDS)


async def remove_image(path: str, access_token: str) -> None:
    await delete_object(settings.STORAGE_BUCKET, path, access_token)
