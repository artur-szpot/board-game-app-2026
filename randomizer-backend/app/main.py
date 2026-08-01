import logging
import os
import random
from contextlib import asynccontextmanager
from typing import Optional

import psycopg
from fastapi import FastAPI
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


def _build_db_dsn() -> Optional[str]:
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    if not all([host, port, db_name, user, password]):
        return None

    return (
        f"host={host} port={port} dbname={db_name} "
        f"user={user} password={password} connect_timeout=3"
    )


def _check_database_connection() -> bool:
    dsn = _build_db_dsn()
    if not dsn:
        logger.info("Database settings not provided; skipping connectivity check")
        return True

    try:
        with psycopg.connect(dsn) as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
    except Exception as exc:
        logger.warning("Database connectivity check failed: %s", exc)
        return False

    logger.info("Database connectivity check succeeded")
    return True


@asynccontextmanager
async def lifespan(_: FastAPI):
    _check_database_connection()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/health")
def health() -> JSONResponse:
    return JSONResponse(status_code=200, content={"status": "ok"})


@app.get("/health/live")
def health_live() -> JSONResponse:
    return JSONResponse(status_code=200, content={"status": "ok"})


@app.get("/health/ready")
def health_ready() -> JSONResponse:
    is_ready = _check_database_connection()
    status_code = 200 if is_ready else 503
    return JSONResponse(status_code=status_code, content={"status": "ok" if is_ready else "error"})


@app.get("/d6", response_model=int)
def roll_d6() -> int:
    return random.randint(1, 6)
