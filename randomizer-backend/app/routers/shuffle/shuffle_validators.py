from typing import List, Tuple

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from .shuffle_dto import (
    ChooseRequestBody,
    PlacementRule,
    PlacementRuleItem,
    PlacementRuleName,
    ShuffleRequestBody,
)

router = APIRouter()


def validate_shuffle_request_body(body: ShuffleRequestBody) -> Tuple[int, List[int]]:
    if body.total is not None and body.items is not None:
        raise HTTPException(
            status_code=400,
            detail="Invalid request. Either total or a list of items must be provided, not both.",
        )
    total = body.total or len(body.items or [])
    if total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid request. Either total or a list of items must be provided.",
        )
    items: List[int] = body.items or [i for i in range(total)]
    return total, items


def validate_choose_request_body(body: ChooseRequestBody, total: int) -> None:
    if body.choose < 1:
        raise HTTPException(
            status_code=400,
            detail="Invalid request. Total to choose must be a positive integer.",
        )
    if body.choose > total:
        raise HTTPException(
            status_code=400,
            detail="Invalid request. Total to choose cannot exceed number of choices.",
        )


def validate_placement_targets(targets: List[int], items: List[int]) -> None:
    for target in targets:
        if target not in items:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid request. Targeted item ({target}) does not exist in items list.",
            )


def validate_placement_rule_item(body: PlacementRuleItem, items: List[int]) -> None:
    match body.rule:
        case PlacementRuleName.must_be_central:
            if len(body.args):
                raise HTTPException(
                    status_code=400,
                    detail='Invalid request. "Must be central" rule takes no arguments.',
                )
        case (
            PlacementRuleName.must_not_share_column_with | PlacementRuleName.must_not_share_row_with
        ):
            if not len(body.args):
                raise HTTPException(
                    status_code=400,
                    detail='Invalid request. "Must not share row/column with" '
                    "rule takes at least one argument.",
                )
            validate_placement_targets(body.args, items)
        case PlacementRuleName.must_keep_distance_from:
            if len(body.args) < 2:
                raise HTTPException(
                    status_code=400,
                    detail='Invalid request. "Must keep distance from" rule '
                    "takes a distance and at least one target.",
                )
            if body.args[0] <= 0:
                raise HTTPException(
                    status_code=400,
                    detail='Invalid request. "Must keep distance from" rule\'s '
                    "first argument (distance) must be a positive integer.",
                )
            validate_placement_targets(body.args[1:], items)


def validate_placement_rule(body: PlacementRule, items: List[int]) -> None:
    validate_placement_targets([body.target], items)
    for rule_item in body.rules:
        validate_placement_rule_item(rule_item, items)
