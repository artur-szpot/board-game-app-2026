import random
from typing import List, Tuple

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from .shuffle_dto import ChooseResponse, PlacementRule, PlacementRuleName

router = APIRouter()


def choose_from_list(items: List[int], total: int) -> ChooseResponse:
    chosen: List[int] = []
    _items = items[:]
    for _ in range(total):
        new_chosen_index = random.randint(0, len(_items) - 1)
        chosen.append(_items[new_chosen_index])
        _items = _items[:new_chosen_index] + _items[new_chosen_index + 1 :]
    return ChooseResponse(chosen=chosen, left=_items)


def get_central_indices(total: int) -> List[int]:
    midpoint = total // 2
    if total % 2:
        return [midpoint]
    return [midpoint - 1, midpoint]


def spread_rectangle(
    width: int,
    height: int,
    items: List[int],
    placement_rules: List[PlacementRule],
) -> ChooseResponse:
    free_indices: List[Tuple[int, int]] = [
        (x, y) for x in range(width) for y in range(height)
    ]
    targets = [rule.target for rule in placement_rules]
    items_to_place = [x for x in items if x not in targets]
    placed_items: List[Tuple[int, Tuple[int, int]]] = []
    for index, rule in enumerate(placement_rules):
        allowed_indices: List[Tuple[int, int]] = free_indices[:]
        for item_index, rule_item in enumerate(rule.rules):
            match rule_item.rule:
                case PlacementRuleName.must_be_central:
                    allowed_x = get_central_indices(width)
                    allowed_y = get_central_indices(height)
                    allowed_indices = [
                        position for position in allowed_indices if position[0] in allowed_x
                    ]
                    allowed_indices = [
                        position for position in allowed_indices if position[1] in allowed_y
                    ]
                case PlacementRuleName.must_not_share_column_with:
                    for referenced_item in rule_item.args:
                        for placed_item, position in placed_items:
                            if placed_item == referenced_item:
                                allowed_indices = [
                                    candidate
                                    for candidate in allowed_indices
                                    if candidate[0] != position[0]
                                ]
                case PlacementRuleName.must_not_share_row_with:
                    for referenced_item in rule_item.args:
                        for placed_item, position in placed_items:
                            if placed_item == referenced_item:
                                allowed_indices = [
                                    candidate
                                    for candidate in allowed_indices
                                    if candidate[1] != position[1]
                                ]
                case PlacementRuleName.must_keep_distance_from:
                    distance = rule_item.args[0]
                    for referenced_item in rule_item.args[1:]:
                        for placed_item, position in placed_items:
                            if placed_item == referenced_item:
                                allowed_indices = [
                                    candidate
                                    for candidate in allowed_indices
                                    if abs(candidate[0] - position[0])
                                    + abs(candidate[1] - position[1])
                                    > distance
                                ]
            if not len(allowed_indices):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid request. Could not satisfy rule at index {index}, "
                    f"item {item_index}.",
                )
        chosen_position_index = random.randint(0, len(allowed_indices) - 1)
        chosen_position = allowed_indices[chosen_position_index]
        placed_items.append((rule.target, chosen_position))
        free_indices = [position for position in free_indices if position != chosen_position]
    for item in items_to_place:
        chosen_position_index = random.randint(0, len(free_indices) - 1)
        chosen_position = free_indices[chosen_position_index]
        placed_items.append((item, chosen_position))
        free_indices = [position for position in free_indices if position != chosen_position]
    chosen: List[int] = []
    for x in range(width):
        for y in range(height):
            for item, position in placed_items:
                if position[0] == x and position[1] == y:
                    chosen.append(item)

    return ChooseResponse(chosen=chosen, left=[])
