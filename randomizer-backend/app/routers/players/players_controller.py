from typing import Annotated, List

from fastapi import APIRouter
from fastapi.params import Query

from .players_dto import TeamsRequest

router = APIRouter()


# Return all teams a user has access to.
# TODO: access control, read those from database
@router.get("/teams", response_model=List[str])
def get_teams(query: Annotated[TeamsRequest, Query()]) -> List[str]:
    return ["S", "ABC", "123"]


# Return all players from a chosen team.
# TODO: access control, read those from database
@router.get("/players", response_model=List[str])
def get_players(team: str) -> List[str]:
    match team:
        case "S":
            return ["B", "D", "M", "A", "E", "R"]
        case "ABC":
            return ["A", "B", "C", "D", "E", "F", "G"]
        case "123":
            return ["1", "2", "3", "4", "5", "6", "7"]
        case _:
            return []
