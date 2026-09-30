from typing import Annotated, List

from fastapi import APIRouter, Depends

from app.auth import CurrentUser, get_current_user

from . import players_repository
from .players_dto import NamedItem

router = APIRouter()


# Teams owned by the caller or shared by SYSTEM.
@router.get("/teams", response_model=List[NamedItem])
def get_teams(user: Annotated[CurrentUser, Depends(get_current_user)]) -> List[NamedItem]:
    return players_repository.get_teams(user.id)


@router.get("/players", response_model=List[NamedItem])
def get_players(
    team_id: str, user: Annotated[CurrentUser, Depends(get_current_user)]
) -> List[NamedItem]:
    return players_repository.get_team_players(team_id, user.id)
