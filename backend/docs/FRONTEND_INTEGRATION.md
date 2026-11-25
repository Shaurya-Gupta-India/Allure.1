# ALLURE frontend integration contract

Base URL for local development: `http://127.0.0.1:8000`
API prefix: `/api/v1`

## Authentication

Continue using Supabase Auth in the frontend. After login, send the current Supabase **access token** with every protected API request:

```http
Authorization: Bearer <supabase_access_token>
```

Never send the Supabase service-role/secret key to the browser. The backend intentionally uses the caller's JWT so database and Storage RLS policies remain active.

## Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend and configuration status |
| GET | `/api/v1/me` | Current authenticated user |
| GET | `/api/v1/models/status` | Whether the model pipeline is connected |
| POST | `/api/v1/upload` | Multipart image upload; field name `file` |
| POST | `/api/v1/analyses` | Create analysis from an uploaded `image_path` |
| GET | `/api/v1/analyses?limit=20` | Current user's history |
| GET | `/api/v1/analyses/{id}` | One analysis and temporary private image URL |
| POST | `/api/v1/analyses/{id}/run` | Run or retry after model integration |
| DELETE | `/api/v1/analyses/{id}` | Delete analysis and private image |

## Upload example (browser)

```js
export async function uploadSkinImage(file, accessToken) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || "Upload failed");
  return body.data; // includes data.path
}
```

Do not set `Content-Type` manually when sending `FormData`; the browser must add the multipart boundary.

## Start analysis example

```js
export async function startSkinAnalysis(imagePath, accessToken) {
  const response = await fetch(`${API_BASE_URL}/api/v1/analyses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_path: imagePath,
      consent_to_analysis: true,
    }),
  });

  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || "Could not start analysis");
  return body;
}
```

Until your partner's trained models are connected, this returns status `awaiting_models` and empty `findings` / `recommendations`. The frontend should show a clear “AI models are being connected” state and must not display fabricated skin scores or results.

## Example response when models are not connected

```json
{
  "id": "<analysis-uuid>",
  "status": "awaiting_models",
  "image_path": "<user-uuid>/<image-file>.png",
  "image_url": "<temporary-signed-url-or-null>",
  "findings": [],
  "recommendations": [],
  "model_version": null,
  "message": "Analysis is saved and waiting for your face, hair, and skin models to be connected. No predictions have been generated.",
  "disclaimer": "ALLURE provides cosmetic and grooming guidance, not a medical diagnosis."
}
```

## Model output contract for your ML partner

Copy `docs/partner_pipeline_template.py` to `app/ml/partner_pipeline.py`, replace its TODOs using your actual model files, then set `ALLURE_MODEL_PIPELINE=app.ml.partner_pipeline:run_analysis` in `backend/.env`. The function must accept image bytes and return:

```python
{
    "model_version": "your-model-version",
    "findings": [
        {
            "domain": "skin",  # skin | hair | face
            "code": "dryness_appearance",
            "confidence": 0.91,
            "severity": "mild",  # low | mild | moderate | high | null
            "label": "Dry-looking skin"  # optional
        }
    ]
}
```

Supported recommendation codes are `acne_appearance`, `dryness_appearance`, `oily_appearance`, `hyperpigmentation_appearance`, `redness_appearance`, `dry_hair_appearance`, `frizz_appearance`, and `breakage_appearance`. Unknown codes are retained as findings but do not generate recommendations. Map the actual model classes to these normalized codes only when the model meaning genuinely matches.

## Frontend behavior guidance

- Use `GET /api/v1/models/status` to decide whether to enable the Analyze button or show an integration status.
- Handle `401` by refreshing the Supabase session and retrying sign-in.
- Handle `400` as a validation/consent issue; `409` as models not ready; `413` is not currently emitted (oversized image returns `400`); and `5xx` as a backend/provider error.
- `image_url` is temporary (default 10 minutes). Request the analysis again to get a fresh URL.
- Keep the user's image private. Never make the `skin-images` bucket public.
- Show the non-medical disclaimer beside findings and recommendations.
