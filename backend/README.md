# ALLURE Backend

FastAPI backend for authenticated image uploads, private Supabase Storage, user-owned analysis history, pluggable face/hair/skin inference, and conservative cosmetic recommendations.

## What is implemented

- Supabase Auth token verification on protected endpoints.
- Private image upload with actual image decoding/type validation and size/dimension limits.
- Supabase Storage uploads using the signed-in user's JWT (no service-role bypass).
- Supabase Postgres analysis persistence with user-scoped RLS.
- Analysis history, retrieval with time-limited signed image URLs, retry, and deletion.
- Pluggable ML pipeline interface; the API reports `awaiting_models` rather than inventing findings until the trained models are available.
- Rule-based cosmetic recommendations only for known, sufficiently confident model output codes.
- Swagger/OpenAPI docs and frontend API contract.

## Requirements

Python 3.11 or 3.12 recommended for the ML dependency ecosystem. Use a fresh virtual environment rather than the `.venv` that was included in the original project ZIP.

## Local setup (macOS)

```bash
cd ALLURE/backend
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`. Do not commit or upload `.env`.

## Supabase setup

1. Open Supabase Dashboard → SQL Editor.
2. Run `sql/001_allure_schema.sql`.
3. Confirm the private `skin-images` bucket exists.
4. Confirm the SQL creates RLS policies for `public.analyses` and `storage.objects`.
5. Create or use a Supabase Auth test user.

The backend uses the user's access token for database and storage calls. It does not need `SUPABASE_SERVICE_ROLE_KEY`.

## Run

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:
- API docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## Test

```bash
pytest -q
```

## Connect your partner's trained models

See `docs/FRONTEND_INTEGRATION.md` for the normalized model output schema and set `ALLURE_MODEL_PIPELINE` to a Python function that accepts image bytes and returns that schema. The face, hair, and skin weights/framework are not present in the supplied ZIP, so the model adapters cannot be implemented against the real weights until your partner shares the files and preprocessing/label details.

## Security notes

- Keep Supabase secret/service-role keys out of the browser and out of Git.
- The bucket must remain private.
- Use HTTPS in deployed environments.
- Set `CORS_ORIGINS` to your exact frontend origin before production.
- Keep user consent explicit before processing a face image.
- Analysis is cosmetic guidance, not diagnosis or a substitute for medical care.
