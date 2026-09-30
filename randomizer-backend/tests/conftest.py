from typing import Iterator

import pytest

from app.auth import CurrentUser, get_current_user
from app.main import app

TEST_USER = CurrentUser(id="user-1", permissions=[])


@pytest.fixture(autouse=True)
def authenticated_user(request: pytest.FixtureRequest) -> Iterator[None]:
    if request.node.get_closest_marker("real_auth"):
        yield
        return
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    yield
    app.dependency_overrides.pop(get_current_user, None)
