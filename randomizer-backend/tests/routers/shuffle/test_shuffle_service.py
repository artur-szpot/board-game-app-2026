from unittest.mock import patch

from app.routers.shuffle.shuffle_dto import PlacementRule, PlacementRuleItem, PlacementRuleName
from app.routers.shuffle.shuffle_service import (
    choose_from_list,
    get_central_indices,
    spread_rectangle,
)


def test_choose_from_list_returns_partition_without_replacement() -> None:
    with patch(
        "app.routers.shuffle.shuffle_service.random.randint",
        side_effect=[1, 0],
    ):
        result = choose_from_list([10, 20, 30], 2)

    assert result.chosen == [20, 10]
    assert result.left == [30]


def test_get_central_indices_returns_zero_based_centers() -> None:
    assert get_central_indices(5) == [2]
    assert get_central_indices(4) == [1, 2]


def test_spread_rectangle_places_every_item_once() -> None:
    with patch(
        "app.routers.shuffle.shuffle_service.random.randint",
        side_effect=[0, 0, 0, 0],
    ):
        result = spread_rectangle(2, 2, [1, 2, 3, 4], [])

    assert result.chosen == [1, 2, 3, 4]
    assert result.left == []


def test_spread_rectangle_places_central_target_in_center() -> None:
    central_rule = PlacementRule(
        target=9,
        rules=[PlacementRuleItem(rule=PlacementRuleName.must_be_central, args=[])],
    )

    with patch(
        "app.routers.shuffle.shuffle_service.random.randint",
        side_effect=[0] * 9,
    ):
        result = spread_rectangle(3, 3, list(range(1, 10)), [central_rule])

    assert result.chosen[4] == 9
    assert sorted(result.chosen) == list(range(1, 10))


def test_spread_rectangle_honors_relative_placement_rules() -> None:
    placement_rules = [
        PlacementRule(target=1, rules=[]),
        PlacementRule(
            target=2,
            rules=[
                PlacementRuleItem(
                    rule=PlacementRuleName.must_not_share_column_with,
                    args=[1],
                )
            ],
        ),
        PlacementRule(
            target=3,
            rules=[
                PlacementRuleItem(
                    rule=PlacementRuleName.must_not_share_row_with,
                    args=[1],
                )
            ],
        ),
        PlacementRule(
            target=4,
            rules=[
                PlacementRuleItem(
                    rule=PlacementRuleName.must_keep_distance_from,
                    args=[1, 1],
                )
            ],
        ),
    ]

    with patch(
        "app.routers.shuffle.shuffle_service.random.randint",
        side_effect=[0] * 9,
    ):
        result = spread_rectangle(3, 3, list(range(1, 10)), placement_rules)

    positions = {
        item: divmod(result.chosen.index(item), 3)
        for item in range(1, 5)
    }
    assert positions[2][0] != positions[1][0]
    assert positions[3][1] != positions[1][1]
    assert (
        abs(positions[4][0] - positions[1][0])
        + abs(positions[4][1] - positions[1][1])
        > 1
    )