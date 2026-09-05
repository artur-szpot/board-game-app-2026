from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_teams_returns_available_teams() -> None:
    response = client.get("/teams", params={"min_players": "2"})

    assert response.status_code == 200
    assert response.json() == ["S", "ABC", "123"]


def test_get_players_returns_players_for_known_team() -> None:
    response = client.get("/players", params={"team": "ABC"})

    assert response.status_code == 200
    assert response.json() == ["A", "B", "C", "D", "E", "F", "G"]


def test_get_players_returns_empty_list_for_unknown_team() -> None:
    response = client.get("/players", params={"team": "unknown"})

    assert response.status_code == 200
    assert response.json() == []