"""Manual Supabase Auth check. Run with: python scripts/check_supabase_auth.py"""
import getpass
import httpx

from app.core.config import settings


def main() -> None:
    if not settings.supabase_configured:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env first.")
    email = input("Supabase test-user email: ").strip()
    password = getpass.getpass("Supabase test-user password: ")
    response = httpx.post(
        f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=30,
    )
    print("HTTP status:", response.status_code)
    if response.is_success:
        payload = response.json()
        print("Authentication successful.")
        print("Access token received:", bool(payload.get("access_token")))
        print("Refresh token received:", bool(payload.get("refresh_token")))
        print("Do not copy tokens into chat or commit them to files.")
    else:
        try:
            print("Authentication failed:", response.json().get("msg", "Check credentials and Auth settings."))
        except ValueError:
            print("Authentication failed. Check credentials and Supabase Auth settings.")


if __name__ == "__main__":
    main()
