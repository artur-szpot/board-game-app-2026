import time

import jwt
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
SECRET = "test-secret"

pytestmark = pytest.mark.real_auth


@pytest.fixture(autouse=True)
def auth_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("AUTH_SECRET", SECRET)


def _token(payload: dict, secret: str = SECRET) -> str:
    return jwt.encode(payload, secret, algorithm="HS256")


def test_rejects_requests_without_token() -> None:
    response = client.get("/d6")

    assert response.status_code == 401


def test_rejects_tokens_signed_with_another_secret() -> None:
    token = _token({"id": "user-1"}, secret="other")
    response = client.get("/d6", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_rejects_expired_tokens() -> None:
    token = _token({"id": "user-1", "exp": int(time.time()) - 10})
    response = client.get("/d6", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_rejects_tokens_without_user_id() -> None:
    token = _token({"email": "a@b.c"})
    response = client.get("/d6", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_accepts_game_backend_tokens() -> None:
    token = _token({"id": "user-1", "email": "a@b.c", "permissions": []})
    response = client.get("/d6", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200


def test_rejects_when_secret_is_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("AUTH_SECRET")
    token = _token({"id": "user-1"})
    response = client.get("/d6", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401


def test_health_stays_public() -> None:
    assert client.get("/health/live").status_code == 200


def test_cors_allows_the_frontend_origin() -> None:
    response = client.options(
        "/d6",
        headers={
            "Origin": "http://localhost:3002",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3002"


def test_cors_rejects_unknown_origins() -> None:
    response = client.options(
        "/d6",
        headers={
            "Origin": "http://evil.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert "access-control-allow-origin" not in response.headers
