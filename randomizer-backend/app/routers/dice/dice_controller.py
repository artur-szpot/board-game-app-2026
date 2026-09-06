import random
from typing import Annotated

from fastapi import APIRouter, Query
from fastapi.exceptions import HTTPException

from .dice_types import Dice
from .dice_validators import check_number, check_sides

router = APIRouter()

@router.get("/d6", response_model=int)
def roll_d6() -> int:
    return random.randint(1, 6)

@router.get("/dice", response_model=Dice)
def roll_dice(dice_query: Annotated[list[str], Query()]) -> Dice:
    if not len(dice_query):
        raise HTTPException(status_code=400, detail="Invalid dice query. Must not be empty.")
    retval: Dice = {}
    for dq in dice_query:
        if dq.startswith("d"):
            number_of_dice = 1
            sides = check_sides(dq[1:], dq)
        else:
            dq_parts = dq.split("d")
            if len(dq_parts) != 2:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid dice query. Dice must be declared as XdY (or dY).",
                )
            number_of_dice = check_number(dq_parts[0], dq)
            sides = check_sides(dq_parts[1], dq)
        results = [random.randint(1, sides) for _ in range(number_of_dice)]
        retval[f"d{sides}"] = results
    return retval

