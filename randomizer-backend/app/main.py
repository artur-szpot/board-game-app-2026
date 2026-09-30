import logging
import os
from contextlib import asynccontextmanager

import psycopg
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth import get_current_user
from app.db import build_db_dsn
from app.routers.dice.dice_controller import router as dice_router
from app.routers.players.players_controller import router as players_router
from app.routers.shuffle.shuffle_controller import router as shuffle_router

logger = logging.getLogger(__name__)

DEFAULT_CORS_ORIGINS = "http://localhost:3002"


def _check_database_connection() -> bool:
    dsn = build_db_dsn()
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",")
        if origin.strip()
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)
_authenticated = [Depends(get_current_user)]
app.include_router(dice_router, dependencies=_authenticated)
app.include_router(players_router, dependencies=_authenticated)
app.include_router(shuffle_router, dependencies=_authenticated)


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
