from __future__ import annotations

import io
import json
import re
from pathlib import Path
from typing import Any

import cv2
import joblib
import mediapipe as mp
import numpy as np
import torch
import torch.nn as nn
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
from PIL import Image
from torchvision import models, transforms

BASE_ML_DIR = Path(__file__).resolve().parent
FACE_DIR = BASE_ML_DIR / "face"
HAIR_DIR = BASE_ML_DIR / "hair"

ALL_FACE_CATEGORIES = ["oval", "round", "square", "oblong", "heart", "diamond"]

LANDMARKS = {
    "forehead_top": 10, "chin_bottom": 152,
    "left_cheek": 234, "right_cheek": 454,
    "left_forehead": 103, "right_forehead": 332,
    "left_temple": 54, "right_temple": 284,
    "left_jaw_upper": 132, "right_jaw_upper": 361,
    "left_jaw": 172, "right_jaw": 397,
    "left_chin": 149, "right_chin": 378,
    "left_eye": 33, "right_eye": 263,
    "nose_tip": 1, "brow_mid": 9,
}

# Lazy-loaded model cache
_cache: dict[str, Any] = {}


def _dist(p1: np.ndarray, p2: np.ndarray) -> float:
    return float(np.linalg.norm(p1 - p2))


def _angle_between(p1: np.ndarray, p2: np.ndarray, p3: np.ndarray) -> float:
    v1, v2 = p1 - p2, p3 - p2
    cos_ang = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
    return float(np.degrees(np.arccos(np.clip(cos_ang, -1.0, 1.0))))


def _to_code(prefix: str, value: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return f"{prefix}_{clean}"


def _load_models() -> None:
    if _cache:
        return

    # 1. Load Model 1 (Face Shape)
    base_options = mp_python.BaseOptions(model_asset_path=str(FACE_DIR / "face_landmarker.task"))
    options = vision.FaceLandmarkerOptions(base_options=base_options, num_faces=1)
    _cache["face_detector"] = vision.FaceLandmarker.create_from_options(options)
    _cache["face_model"] = joblib.load(FACE_DIR / "face_shape_model.pkl")
    _cache["face_scaler"] = joblib.load(FACE_DIR / "scaler.pkl")

    # 2. Load Model 2 (Hair Texture)
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    with open(HAIR_DIR / "hair_classes.json", "r", encoding="utf-8") as f:
        hair_classes = json.load(f)

    hair_model = models.mobilenet_v3_large(weights=None)
    in_features = hair_model.classifier[3].in_features
    hair_model.classifier[3] = nn.Linear(in_features, len(hair_classes))
    hair_model.load_state_dict(torch.load(HAIR_DIR / "hair_texture_model.pth", map_location=device))
    hair_model.to(device)
    hair_model.eval()

    _cache["device"] = device
    _cache["hair_model"] = hair_model
    _cache["hair_classes"] = hair_classes
    _cache["hair_transform"] = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])


def _extract_face_features(img_bgr: np.ndarray) -> list[float] | None:
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    result = _cache["face_detector"].detect(mp_image)
    if not result.face_landmarks:
        return None

    lms = result.face_landmarks[0]
    h, w, _ = img_bgr.shape
    pts = {name: np.array([lms[idx].x * w, lms[idx].y * h]) for name, idx in LANDMARKS.items()}

    eye_vec = pts["right_eye"] - pts["left_eye"]
    angle = np.arctan2(eye_vec[1], eye_vec[0])
    rot_mat = np.array([[np.cos(-angle), -np.sin(-angle)], [np.sin(-angle), np.cos(-angle)]])
    center = pts["nose_tip"]
    pts = {k: rot_mat @ (v - center) for k, v in pts.items()}

    face_h = _dist(pts["forehead_top"], pts["chin_bottom"]) + 1e-6
    cheek_w = _dist(pts["left_cheek"], pts["right_cheek"]) + 1e-6
    forehead_w = _dist(pts["left_forehead"], pts["right_forehead"]) + 1e-6
    temple_w = _dist(pts["left_temple"], pts["right_temple"]) + 1e-6
    jaw_upper_w = _dist(pts["left_jaw_upper"], pts["right_jaw_upper"]) + 1e-6
    jaw_w = _dist(pts["left_jaw"], pts["right_jaw"]) + 1e-6
    chin_w = _dist(pts["left_chin"], pts["right_chin"]) + 1e-6

    upper_h = _dist(pts["forehead_top"], pts["brow_mid"])
    mid_h = _dist(pts["brow_mid"], pts["nose_tip"])
    lower_h = _dist(pts["nose_tip"], pts["chin_bottom"])

    left_jaw_angle = _angle_between(pts["left_cheek"], pts["left_jaw"], pts["chin_bottom"])
    right_jaw_angle = _angle_between(pts["right_cheek"], pts["right_jaw"], pts["chin_bottom"])
    chin_angle = _angle_between(pts["left_jaw"], pts["chin_bottom"], pts["right_jaw"])

    return [
        face_h / cheek_w, forehead_w / cheek_w, temple_w / cheek_w,
        jaw_upper_w / cheek_w, jaw_w / cheek_w, chin_w / cheek_w,
        forehead_w / jaw_w, temple_w / jaw_w, chin_w / jaw_w,
        upper_h / face_h, mid_h / face_h, lower_h / face_h,
        lower_h / cheek_w, (left_jaw_angle + right_jaw_angle) / 360.0,
        chin_angle / 180.0, (cheek_w - jaw_w) / face_h,
        (forehead_w - chin_w) / face_h, jaw_upper_w / jaw_w,
    ]


def analyze_image(image_bytes: bytes) -> dict[str, Any]:
    _load_models()
    findings: list[dict[str, Any]] = []

    # Decode image for OpenCV (Face) and PIL (Hair)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # --- Model 1: Face Shape ---
    if img_bgr is not None:
        features = _extract_face_features(img_bgr)
        if features is not None:
            scaled = _cache["face_scaler"].transform([features])
            probs = _cache["face_model"].predict_proba(scaled)[0]
            classes = _cache["face_model"].classes_
            best_idx = int(np.argmax(probs))
            class_id = int(classes[best_idx])
            shape_name = ALL_FACE_CATEGORIES[class_id]

            findings.append({
                "domain": "face",
                "code": _to_code("face_shape", shape_name),
                "confidence": round(float(probs[best_idx]), 4),
                "label": f"{shape_name.capitalize()} Face Shape",
            })

    # --- Model 2: Hair Texture ---
    tensor = _cache["hair_transform"](pil_img).unsqueeze(0).to(_cache["device"])
    with torch.no_grad():
        logits = _cache["hair_model"](tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    best_hair_idx = int(np.argmax(probs))
    hair_name = _cache["hair_classes"][best_hair_idx]

    findings.append({
        "domain": "hair",
        "code": _to_code("hair_texture", hair_name),
        "confidence": round(float(probs[best_hair_idx]), 4),
        "label": f"{hair_name.capitalize()} Hair Texture",
    })

    return {
        "model_version": "allure-v1-face-hair",
        "findings": findings,
    }
