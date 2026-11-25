
from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """Create and return a Supabase client."""

    if not settings.SUPABASE_URL:
        raise ValueError("SUPABASE_URL is missing")

    if not settings.SUPABASE_ANON_KEY:
        raise ValueError("SUPABASE_ANON_KEY is missing")

    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY
    )


supabase: Client = get_supabase_client()
