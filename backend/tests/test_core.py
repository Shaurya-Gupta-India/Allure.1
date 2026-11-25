from app.schemas.api import Finding
from app.services.image_service import validate_image
from app.services.recommendation_service import build_recommendations
from io import BytesIO
from PIL import Image
import pytest


def make_png() -> bytes:
    stream = BytesIO()
    Image.new("RGB", (128, 128), "white").save(stream, format="PNG")
    return stream.getvalue()


def test_valid_png_is_detected():
    content_type, width, height = validate_image(make_png(), "image/png")
    assert content_type == "image/png"
    assert (width, height) == (128, 128)


def test_empty_image_is_rejected():
    with pytest.raises(ValueError):
        validate_image(b"", "image/png")


def test_mismatched_mime_is_rejected():
    with pytest.raises(ValueError):
        validate_image(make_png(), "image/jpeg")


def test_recommendations_only_for_known_confident_findings():
    findings = [
        Finding(domain="skin", code="dryness_appearance", confidence=0.9),
        Finding(domain="skin", code="unknown_code", confidence=0.99),
        Finding(domain="hair", code="frizz_appearance", confidence=0.2),
    ]
    results = build_recommendations(findings)
    assert len(results) == 1
    assert results[0].based_on == "dryness_appearance"
