import logging
import os
import random
from contextlib import asynccontextmanager
from typing import Optional

import psycopg
from fastapi import FastAPI

logger = logging.getLogger(__name__)


def _get_env(name: str, fallback: str) -> Optional[str]:
    value = os.getenv(name)
    if value:
        return value
    return os.getenv(fallback)


def _build_db_dsn() -> Optional[str]:
    host = _get_env("DB_HOST", "DATABASE_HOST")
    port = _get_env("DB_PORT", "DATABASE_PORT")
    db_name = _get_env("DB_NAME", "DATABASE_NAME")
    user = _get_env("DB_USER", "DATABASE_USER")
    password = _get_env("DB_PASSWORD", "DATABASE_PASSWORD")

    if not all([host, port, db_name, user, password]):
        return None

    return (
        f"host={host} port={port} dbname={db_name} "
        f"user={user} password={password} connect_timeout=3"
    )


def _check_database_connection() -> None:
    dsn = _build_db_dsn()
    if not dsn:
        logger.info("Database settings not provided; skipping connectivity check")
        return

    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

    logger.info("Database connectivity check succeeded")


@asynccontextmanager
async def lifespan(_: FastAPI):
    _check_database_connection()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/d6", response_model=int)
def roll_d6() -> int:
    return random.randint(1, 6)
