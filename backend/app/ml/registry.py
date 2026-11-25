from __future__ import annotations

import importlib
from typing import Any, Callable

from app.core.config import settings
from app.schemas.api import ModelAnalysisOutput


class ModelsNotConfigured(RuntimeError):
    pass


class ModelPipelineError(RuntimeError):
    pass


def _load_runner() -> Callable[[bytes], Any]:
    configured = settings.ALLURE_MODEL_PIPELINE.strip()
    if not configured:
        raise ModelsNotConfigured(
            "The face, hair, and skin models are not connected yet. Set ALLURE_MODEL_PIPELINE after adding the model adapter."
        )
    if ":" not in configured:
        raise ModelPipelineError("ALLURE_MODEL_PIPELINE must use the format 'python.module.path:function_name'.")
    module_name, function_name = configured.split(":", 1)
    try:
        module = importlib.import_module(module_name)
        runner = getattr(module, function_name)
    except (ImportError, AttributeError) as exc:
        raise ModelPipelineError("The configured model pipeline could not be loaded. Check its module path and dependencies.") from exc
    if not callable(runner):
        raise ModelPipelineError("The configured model pipeline entry point is not callable.")
    return runner


def model_status() -> dict[str, Any]:
    if not settings.ALLURE_MODEL_PIPELINE.strip():
        return {"configured": False, "ready": False, "message": "Model files are not connected. Upload and account APIs can be used; analysis will wait for model integration."}
    try:
        _load_runner()
    except ModelPipelineError as exc:
        return {"configured": True, "ready": False, "message": str(exc)}
    return {"configured": True, "ready": True, "message": "The configured model pipeline is importable."}


def run_model_pipeline(image_bytes: bytes) -> ModelAnalysisOutput:
    runner = _load_runner()
    try:
        raw = runner(image_bytes)
        if hasattr(raw, "model_dump"):
            raw = raw.model_dump()
        return ModelAnalysisOutput.model_validate(raw)
    except ModelsNotConfigured:
        raise
    except Exception as exc:
        raise ModelPipelineError("Model inference failed. Check the model adapter logs.") from exc
