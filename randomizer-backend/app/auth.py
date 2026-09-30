import logging
import os
from typing import Annotated, List

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)


class CurrentUser(BaseModel):
    id: str
    permissions: List[dict] = []


def _unauthorized() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized",
        headers={"WWW-Authenticate": "Bearer"},
    )


# Tokens are issued by game-backend with the shared AUTH_SECRET (HS256).
def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> CurrentUser:
    secret = os.getenv("AUTH_SECRET")
    if not secret:
        logger.error("AUTH_SECRET is not configured; rejecting request")
        raise _unauthorized()
    if credentials is None:
        raise _unauthorized()
    try:
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise _unauthorized()
    user_id = payload.get("id")
    if not isinstance(user_id, str) or not user_id:
        raise _unauthorized()
    return CurrentUser(id=user_id, permissions=payload.get("permissions") or [])
