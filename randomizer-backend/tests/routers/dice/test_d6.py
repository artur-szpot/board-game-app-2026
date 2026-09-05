from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_d6_returns_number_between_1_and_6() -> None:
    response = client.get("/d6")

    assert response.status_code == 200
    value = response.json()

    assert isinstance(value, int)
    assert 1 <= value <= 6
