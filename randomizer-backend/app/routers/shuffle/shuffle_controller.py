from typing import List

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from .shuffle_dto import (
    ChooseRequestBody,
    ChooseResponse,
    RectangularSpreadRequestBody,
    ShuffleRequestBody,
)
from .shuffle_service import choose_from_list
from .shuffle_service import spread_rectangle as spread_function
from .shuffle_validators import (
    validate_choose_request_body,
    validate_placement_rule,
    validate_shuffle_request_body,
)

router = APIRouter()


@router.post("/choose")
def choose(body: ChooseRequestBody) -> ChooseResponse:
    total, items = validate_shuffle_request_body(body)
    validate_choose_request_body(body, total)
    if body.shuffle:
        return choose_from_list(items, body.choose)
    else:
        item_indices: List[int] = [i for i in range(len(items))]
        chosen_indices: ChooseResponse = choose_from_list(item_indices, body.choose)
        chosen: List[int] = [
            item for index, item in enumerate(items) if index in chosen_indices.chosen
        ]
        left: List[int] = [
            item for index, item in enumerate(items) if index not in chosen_indices.chosen
        ]
        return ChooseResponse(chosen=chosen, left=left)


@router.post("/shuffle")
def shuffle(body: ShuffleRequestBody) -> ChooseResponse:
    _, items = validate_shuffle_request_body(body)
    return choose_from_list(items, len(items))



@router.post("/spread-rectangle")
def spread_rectangle(body: RectangularSpreadRequestBody) -> ChooseResponse:
    _, items = validate_shuffle_request_body(body)
    if body.width <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid request. Spread width must be a positive integer.",
        )
    if len(items) % body.width:
        raise HTTPException(
            status_code=400,
            detail="Invalid request. The number of items must be divisible by width.",
        )
    width: int = body.width
    height: int = len(items) // width
    placement_rules = body.placement_rules or []
    for rule in placement_rules:
        validate_placement_rule(rule, items)
    return spread_function(width,height,items,placement_rules)
    
