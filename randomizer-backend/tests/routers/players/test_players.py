from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.routers.players.players_dto import NamedItem

client = TestClient(app)


def test_get_teams_returns_teams_visible_to_the_caller() -> None:
    teams = [NamedItem(id="team-abc", name="ABC")]
    with patch("app.routers.players.players_repository.get_teams", return_value=teams) as get_teams:
        response = client.get("/teams")

    assert response.status_code == 200
    assert response.json() == [{"id": "team-abc", "name": "ABC"}]
    get_teams.assert_called_once_with("user-1")


def test_get_players_returns_players_of_the_team() -> None:
    players = [NamedItem(id="p-a", name="A"), NamedItem(id="p-b", name="B")]
    with patch(
        "app.routers.players.players_repository.get_team_players",
        return_value=players,
    ) as get_team_players:
        response = client.get("/players", params={"team_id": "team-abc"})

    assert response.status_code == 200
    assert response.json() == [{"id": "p-a", "name": "A"}, {"id": "p-b", "name": "B"}]
    get_team_players.assert_called_once_with("team-abc", "user-1")


def test_get_players_requires_team_id() -> None:
    response = client.get("/players")

    assert response.status_code == 422


def test_repository_scopes_queries_to_caller_and_system() -> None:
    from app.routers.players import players_repository

    with patch.object(players_repository, "_fetch", return_value=[]) as fetch:
        players_repository.get_team_players("team-abc", "user-1")

    assert fetch.call_args.args[1] == ("team-abc", ["user-1", "SYSTEM"])
