from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_roll_dice_supports_single_and_multiple_dice() -> None:
    with patch(
        "app.routers.dice.dice_controller.random.randint",
        side_effect=[4, 2, 7],
    ):
        response = client.get("/dice", params={"dice_query": ["d6", "2d8"]})

    assert response.status_code == 200
    assert response.json() == {"d6": [4], "d8": [2, 7]}


@pytest.mark.parametrize(
    ("query", "detail"),
    [
        ("0d6", "Invalid dice query. Number of dice must be 1 or more."),
        ("2d1", "Invalid dice query. A die must have at least 2 sides."),
        ("foo", "Invalid dice query. Dice must be declared as XdY (or dY)."),
        ("2dx", "Invalid dice query. Couldn't parse number of sides in 2dx"),
    ],
)
def test_roll_dice_rejects_invalid_queries(query: str, detail: str) -> None:
    response = client.get("/dice", params={"dice_query": query})

    assert response.status_code == 400
    assert response.json() == {"detail": detail}
