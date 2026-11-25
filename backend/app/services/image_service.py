from __future__ import annotations

from io import BytesIO
import warnings

from PIL import Image, UnidentifiedImageError

from app.core.config import settings

ALLOWED_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}


def validate_image(data: bytes, declared_content_type: str | None) -> tuple[str, int, int]:
    if not data:
        raise ValueError("The uploaded file is empty.")
    if len(data) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise ValueError(f"Image exceeds the {settings.MAX_UPLOAD_SIZE_MB} MB upload limit.")

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(data)) as image:
                image.verify()
            with Image.open(BytesIO(data)) as image:
                image_format = (image.format or "").upper()
                width, height = image.size
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
        raise ValueError("The file is not a valid, supported image or is too large to process safely.") from exc

    content_type = ALLOWED_FORMATS.get(image_format)
    if not content_type:
        raise ValueError("Only JPEG, PNG, and WEBP images are supported.")
    if declared_content_type and declared_content_type not in (content_type, "application/octet-stream"):
        raise ValueError("The file content does not match its declared image type.")
    if width < 64 or height < 64:
        raise ValueError("Image dimensions must be at least 64 × 64 pixels.")
    if width * height > 40_000_000:
        raise ValueError("Image dimensions are too large. Upload an image under 40 megapixels.")
    return content_type, width, height
