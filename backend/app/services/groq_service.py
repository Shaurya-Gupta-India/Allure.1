from __future__ import annotations

import os
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def generate_grooming_explanation(findings: list[dict[str, Any]]) -> str:
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip()

    if not api_key:
        return "Groq API key not configured. Add GROQ_API_KEY to backend/.env to enable AI explanations."

    if not findings:
        return "No face or hair features were detected clearly. Please take a well-lit, front-facing photo."

    summary_lines = [
        f"- {f.get('domain', '').capitalize()}: {f.get('label', f.get('code'))} "
        f"(confidence: {round(float(f.get('confidence', 0)) * 100, 1)}%)"
        for f in findings
    ]
    findings_text = "\n".join(summary_lines)

    prompt = (
        "You are ALLURE, a friendly personal grooming and style advisor.\n"
        "Our ML models analyzed the user's photo and detected:\n"
        f"{findings_text}\n\n"
        "Give a simple, clear, encouraging explanation in 3 short sections:\n"
        "1. What your face shape & hair texture mean\n"
        "2. Top 2 hairstyle recommendations that suit this combination\n"
        "3. One quick daily hair care tip\n"
        "Keep it under 150 words and easy to read."
    )

    try:
        response = httpx.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You give concise, practical cosmetic and grooming advice."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.6,
                "max_tokens": 300,
            },
            timeout=20.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        return f"ML analysis succeeded, but Groq explanation failed: {exc}"
