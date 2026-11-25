from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    id: str
    email: str | None = None


class UploadResponseData(BaseModel):
    bucket: str
    path: str
    file_name: str
    size_bytes: int
    width: int
    height: int
    content_type: str
    image_url: str | None = None


class UploadResponse(BaseModel):
    success: bool = True
    message: str
    data: UploadResponseData


class CreateAnalysisRequest(BaseModel):
    image_path: str = Field(min_length=3, max_length=1024)
    consent_to_analysis: bool = False


class Finding(BaseModel):
    model_config = ConfigDict(extra="ignore")
    domain: Literal["skin", "hair", "face"]
    code: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9_]+$")
    confidence: float = Field(ge=0.0, le=1.0)
    severity: Literal["low", "mild", "moderate", "high"] | None = None
    label: str | None = Field(default=None, max_length=120)


class ModelAnalysisOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    model_version: str = Field(default="partner-models", max_length=100)
    findings: list[Finding] = Field(default_factory=list, max_length=100)


class Recommendation(BaseModel):
    id: str
    title: str
    reason: str
    actions: list[str]
    ingredients_to_consider: list[str] = Field(default_factory=list)
    domain: Literal["skin", "hair", "face"]
    based_on: str


class AnalysisResponse(BaseModel):
    id: UUID
    status: Literal["awaiting_models", "processing", "completed", "failed"]
    image_path: str
    image_url: str | None = None
    findings: list[Finding] = Field(default_factory=list)
    recommendations: list[Recommendation] = Field(default_factory=list)
    model_version: str | None = None
    created_at: datetime | str | None = None
    updated_at: datetime | str | None = None
    message: str | None = None
    error_message: str | None = None
    disclaimer: str = "ALLURE provides cosmetic and grooming guidance, not a medical diagnosis."


class AnalysisListItem(BaseModel):
    id: UUID
    status: str
    created_at: datetime | str | None = None
    updated_at: datetime | str | None = None
    model_version: str | None = None


class ModelStatusResponse(BaseModel):
    configured: bool
    ready: bool
    message: str


class DeleteResponse(BaseModel):
    success: bool = True
    message: str
