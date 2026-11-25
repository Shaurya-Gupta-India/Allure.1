from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db.supabase_rest import SupabaseNotConfigured, SupabaseRequestError, verify_access_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_access_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Sign in and send your Supabase access token as a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials


async def get_current_user(access_token: str = Depends(get_access_token)) -> dict[str, Any]:
    try:
        user = await verify_access_token(access_token)
    except SupabaseNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SupabaseRequestError as exc:
        if exc.status_code in (400, 401, 403):
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired authentication token. Sign in again.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    if not user or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
    return user
