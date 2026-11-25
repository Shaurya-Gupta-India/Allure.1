"""Small async Supabase REST client scoped to the current user's JWT.

No service-role key is used. Postgres RLS and Storage policies remain the
source of authorization for all user-owned resources.
"""

from __future__ import annotations

from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings


class SupabaseNotConfigured(RuntimeError):
    pass


class SupabaseRequestError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502, details: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details


def _base_url() -> str:
    if not settings.supabase_configured:
        raise SupabaseNotConfigured("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env.")
    return settings.SUPABASE_URL


def _headers(access_token: str, content_type: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


async def _request(
    method: str,
    path: str,
    access_token: str,
    *,
    json: Any = None,
    content: bytes | None = None,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> Any:
    url = f"{_base_url()}/{path.lstrip('/')}"
    request_headers = _headers(access_token)
    if headers:
        request_headers.update(headers)
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
            response = await client.request(
                method,
                url,
                headers=request_headers,
                json=json,
                content=content,
                params=params,
            )
    except httpx.TimeoutException as exc:
        raise SupabaseRequestError("Supabase request timed out.", 504) from exc
    except httpx.HTTPError as exc:
        raise SupabaseRequestError("Could not connect to Supabase.", 502) from exc

    if response.status_code >= 400:
        try:
            payload = response.json()
            detail = payload.get("message") or payload.get("msg") or payload.get("error_description") or str(payload)
        except ValueError:
            detail = response.text[:500]
        raise SupabaseRequestError("Supabase rejected the request.", response.status_code, str(detail))

    if response.status_code == 204 or not response.content:
        return None
    try:
        return response.json()
    except ValueError:
        return response.text


async def verify_access_token(access_token: str) -> dict[str, Any]:
    return await _request("GET", "auth/v1/user", access_token)


async def upload_object(bucket: str, path: str, data: bytes, content_type: str, access_token: str) -> None:
    encoded_path = quote(path, safe="/")
    await _request(
        "POST",
        f"storage/v1/object/{quote(bucket, safe='')}/{encoded_path}",
        access_token,
        content=data,
        headers={
            "Content-Type": content_type,
            "x-upsert": "false",
        },
    )


async def download_object(bucket: str, path: str, access_token: str) -> bytes:
    encoded_path = quote(path, safe="/")
    url = f"{_base_url()}/storage/v1/object/{quote(bucket, safe='')}/{encoded_path}"
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url, headers=_headers(access_token))
    except httpx.HTTPError as exc:
        raise SupabaseRequestError("Could not download the stored image.", 502) from exc
    if response.status_code >= 400:
        raise SupabaseRequestError("Could not download the stored image.", response.status_code, response.text[:500])
    return response.content


async def delete_object(bucket: str, path: str, access_token: str) -> None:
    await _request(
        "DELETE",
        f"storage/v1/object/{quote(bucket, safe='')}",
        access_token,
        json={"prefixes": [path]},
        headers={"Content-Type": "application/json"},
    )


async def create_signed_url(bucket: str, path: str, access_token: str, expires_in: int) -> str:
    encoded_path = quote(path, safe="/")
    result = await _request(
        "POST",
        f"storage/v1/object/sign/{quote(bucket, safe='')}/{encoded_path}",
        access_token,
        json={"expiresIn": expires_in},
        headers={"Content-Type": "application/json"},
    )
    signed_path = result.get("signedURL") or result.get("signedUrl") or result.get("signed_url")
    if not signed_path:
        raise SupabaseRequestError("Supabase did not return a signed image URL.", 502)
    if signed_path.startswith("http://") or signed_path.startswith("https://"):
        return signed_path
    return f"{_base_url()}/storage/v1{signed_path if signed_path.startswith('/') else '/' + signed_path}"


async def insert_analysis(payload: dict[str, Any], access_token: str) -> dict[str, Any]:
    result = await _request(
        "POST",
        "rest/v1/analyses",
        access_token,
        json=payload,
        params={"select": "*"},
        headers={"Content-Type": "application/json", "Prefer": "return=representation"},
    )
    if not result:
        raise SupabaseRequestError("Analysis record was not returned by Supabase.", 502)
    return result[0] if isinstance(result, list) else result


async def get_analysis(analysis_id: str, access_token: str) -> dict[str, Any] | None:
    result = await _request(
        "GET",
        "rest/v1/analyses",
        access_token,
        params={"id": f"eq.{analysis_id}", "select": "*", "limit": "1"},
    )
    return result[0] if result else None


async def list_analyses(access_token: str, limit: int = 20) -> list[dict[str, Any]]:
    result = await _request(
        "GET",
        "rest/v1/analyses",
        access_token,
        params={"select": "id,status,created_at,updated_at,model_version", "order": "created_at.desc", "limit": str(limit)},
    )
    return result or []


async def update_analysis(analysis_id: str, payload: dict[str, Any], access_token: str) -> dict[str, Any] | None:
    result = await _request(
        "PATCH",
        "rest/v1/analyses",
        access_token,
        json=payload,
        params={"id": f"eq.{analysis_id}", "select": "*"},
        headers={"Content-Type": "application/json", "Prefer": "return=representation"},
    )
    return result[0] if result else None


async def delete_analysis(analysis_id: str, access_token: str) -> None:
    await _request(
        "DELETE",
        "rest/v1/analyses",
        access_token,
        params={"id": f"eq.{analysis_id}"},
        headers={"Prefer": "return=minimal"},
    )
