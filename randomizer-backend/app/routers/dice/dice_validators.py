from fastapi.exceptions import HTTPException


def check_sides(query: str, dq: str) -> int:
    try:
        sides = int(query)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid dice query. Couldn't parse number of sides in {dq}",
        )
    if sides < 2:
        raise HTTPException(
            status_code=400, detail="Invalid dice query. A die must have at least 2 sides."
        )
    return sides


def check_number(query: str, dq: str) -> int:
    try:
        number_of_dice = int(query)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid dice query. Couldn't parse number of dice in {dq}",
        )
    if number_of_dice < 1:
        raise HTTPException(
            status_code=400, detail="Invalid dice query. Number of dice must be 1 or more."
        )
    return number_of_dice
