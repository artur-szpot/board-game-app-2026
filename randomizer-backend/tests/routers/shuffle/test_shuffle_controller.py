from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_choose_without_shuffle_preserves_original_order() -> None:
    with patch(
        "app.routers.shuffle.shuffle_service.random.randint",
        side_effect=[2, 0],
    ):
        response = client.post(
            "/choose",
            json={
                "total": None,
                "items": [10, 20, 30, 40],
                "choose": 2,
                "shuffle": False,
            },
        )

    assert response.status_code == 200
    assert response.json() == {"chosen": [10, 30], "left": [20, 40]}


def test_shuffle_returns_all_items_in_randomized_order() -> None:
    with patch(
        "app.routers.shuffle.shuffle_service.random.randint",
        side_effect=[2, 0, 0],
    ):
        response = client.post(
            "/shuffle",
            json={"total": None, "items": [10, 20, 30]},
        )

    assert response.status_code == 200
    assert response.json() == {"chosen": [30, 10, 20], "left": []}


@pytest.mark.parametrize(
    ("body", "detail"),
    [
        (
            {"total": 3, "items": [1, 2, 3], "choose": 1, "shuffle": True},
            "Invalid request. Either total or a list of items must be provided, not both.",
        ),
        (
            {"total": 2, "items": None, "choose": 3, "shuffle": True},
            "Invalid request. Total to choose cannot exceed number of choices.",
        ),
    ],
)
def test_choose_rejects_invalid_requests(body: dict[str, object], detail: str) -> None:
    response = client.post("/choose", json=body)

    assert response.status_code == 400
    assert response.json() == {"detail": detail}


def test_spread_rectangle_rejects_non_divisible_dimensions() -> None:
    response = client.post(
        "/spread-rectangle",
        json={"total": 5, "items": None, "width": 2, "placement_rules": None},
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Invalid request. The number of items must be divisible by width."
    }
