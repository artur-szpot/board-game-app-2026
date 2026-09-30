import os
from typing import Optional


def build_db_dsn() -> Optional[str]:
    host = os.getenv("DATABASE_HOST")
    port = os.getenv("DATABASE_PORT")
    db_name = os.getenv("DATABASE_NAME")
    user = os.getenv("DATABASE_USER")
    password = os.getenv("DATABASE_PASSWORD")

    if not all([host, port, db_name, user, password]):
        return None

    return (
        f"host={host} port={port} dbname={db_name} "
        f"user={user} password={password} connect_timeout=3"
    )
