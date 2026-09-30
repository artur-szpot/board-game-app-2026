from typing import List

import psycopg
from fastapi import HTTPException

from app.db import build_db_dsn

from .players_dto import NamedItem

SYSTEM_OWNER_ID = "SYSTEM"

_SELECT_TEAMS_SQL = """
    SELECT id, name
    FROM teams
    WHERE owner_id = ANY(%s)
    ORDER BY name
"""

_SELECT_TEAM_PLAYERS_SQL = """
    SELECT p.id, p.name
    FROM players p
    JOIN team_players tp ON tp.player_id = p.id
    JOIN teams t ON t.id = tp.team_id
    WHERE t.id = %s AND t.owner_id = ANY(%s)
    ORDER BY p.name
"""


def _fetch(query: str, args: tuple) -> List[NamedItem]:
    dsn = build_db_dsn()
    if not dsn:
        raise HTTPException(status_code=503, detail="Database is not configured.")
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, args)
            return [NamedItem(id=row[0], name=row[1]) for row in cursor.fetchall()]


def get_teams(user_id: str) -> List[NamedItem]:
    return _fetch(_SELECT_TEAMS_SQL, ([user_id, SYSTEM_OWNER_ID],))


def get_team_players(team_id: str, user_id: str) -> List[NamedItem]:
    return _fetch(_SELECT_TEAM_PLAYERS_SQL, (team_id, [user_id, SYSTEM_OWNER_ID]))
