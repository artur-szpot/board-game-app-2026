from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TeamsRequest(BaseModel):
    min_players: str | None
