from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_and_health_are_available():
    assert client.get("/").status_code == 200
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["application"] == "ALLURE"


def test_openapi_contains_frontend_endpoints():
    schema = client.get("/openapi.json").json()
    paths = schema["paths"]
    assert "/api/v1/upload" in paths
    assert "/api/v1/analyses" in paths
    assert "/api/v1/analyses/{analysis_id}" in paths
    assert "/api/v1/models/status" in paths
    assert "/api/v1/me" in paths


def test_protected_endpoint_requires_bearer_token():
    response = client.get("/api/v1/me")
    assert response.status_code == 401
