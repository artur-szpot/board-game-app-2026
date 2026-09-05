import pytest
from fastapi import HTTPException

from app.routers.shuffle.shuffle_dto import PlacementRuleItem, PlacementRuleName
from app.routers.shuffle.shuffle_validators import validate_placement_rule_item


def test_distance_rule_accepts_positive_distance_and_existing_target() -> None:
    rule = PlacementRuleItem(
        rule=PlacementRuleName.must_keep_distance_from,
        args=[2, 10],
    )

    validate_placement_rule_item(rule, [10, 20])


@pytest.mark.parametrize("args", [[], [2], [0, 10]])
def test_distance_rule_rejects_missing_or_non_positive_arguments(args: list[int]) -> None:
    rule = PlacementRuleItem(
        rule=PlacementRuleName.must_keep_distance_from,
        args=args,
    )

    with pytest.raises(HTTPException) as error:
        validate_placement_rule_item(rule, [10, 20])

    assert error.value.status_code == 400
