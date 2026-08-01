from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_live_returns_ok() -> None:
    response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_ready_returns_ok_when_database_is_reachable() -> None:
    with patch("app.main._check_database_connection", return_value=True):
        response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_ready_returns_error_when_database_is_unreachable() -> None:
    with patch("app.main._check_database_connection", return_value=False):
        response = client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {"status": "error"}
