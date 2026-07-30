# FastAPI Backend Addition Plan

## Goal

Add a second backend service using Python + FastAPI, while renaming the existing Nest.js backend for clarity and wiring both into local Docker workflows and CI.

## Scope Summary

- Existing Nest.js backend directory will be renamed to `game-backend`.
- New FastAPI service will live in `randomizer-backend`.
- New service exposes `GET /d6` returning a plain number in range 1-6.
- New service connects to the same PostgreSQL database used by the existing backend.
- Compose files are updated with both backends (`game-backend` + `randomizer-backend`).
- CI is updated with a new lint workflow for `randomizer-backend` and a new test/build job in PR CI.

## Out of Scope / Follow-up

- Full auth/authz endpoints in `randomizer-backend` are out of scope for this task.
- Health/readiness endpoints are out of scope for this task (planned separately in `plan/docker-cleanup.md`).

## Assumptions

- Environment can be recreated (`docker compose down -v` then up) after service rename.
- Database credentials/secrets strategy should mirror existing backend where possible.

## Subtasks

### A) Rename Existing Backend to `game-backend`

Changes:

- Rename repo directory `backend` -> `game-backend`.
- Update all references that point to `backend` paths in:
  - Dockerfiles/compose contexts.
  - CI workflows and working directories.
  - Local helper scripts (`dev`, `go`, and \*.bat variants) if they reference `backend`.
  - Any docs/config/scripts with hardcoded `backend/` paths.

Acceptance criteria:

- No broken path references remain for renamed service.
- Existing backend can still build, test, and run after rename.

### B) Scaffold `randomizer-backend` (FastAPI)

Stack decisions:

- Python with `pip` + `requirements.txt`.
- Testing with `pytest`.
- Linting with `ruff`.

Minimum project structure:

- `randomizer-backend/requirements.txt`
- `randomizer-backend/requirements-dev.txt` (if separating dev tools)
- `randomizer-backend/app/main.py` (FastAPI app)
- `randomizer-backend/tests/test_d6.py`
- `randomizer-backend/Dockerfile`
- Optional but recommended config files:
  - `randomizer-backend/pytest.ini`
  - `randomizer-backend/ruff.toml` (or `pyproject.toml` containing tool config)

Acceptance criteria:

- `pip install -r requirements.txt` succeeds.
- `pytest` runs and passes.
- `ruff check .` runs and passes.
- Docker image builds successfully.

Note on "what config is needed":

- `pytest` can run without config, but `pytest.ini` is recommended for stable defaults.
- `ruff` can run with defaults, but explicit config keeps team-wide behavior predictable.

### C) Implement `GET /d6`

Behavior:

- Route: `GET /d6`
- Response: plain number (not wrapped JSON object), integer in inclusive range [1, 6].

Tests:

- Unit/API test verifies status success.
- Test verifies returned value is integer and `1 <= value <= 6`.

Acceptance criteria:

- Endpoint is reachable in local run and container run.
- Tests cover value range contract.

### D) Database Connectivity Foundation

Goal for this task:

- Connect `randomizer-backend` to the same PostgreSQL instance used by `game-backend`.
- Validate connection can be established (startup-time check or lightweight query path).

Config expectations:

- Mirror existing backend secret/env pattern where possible.
- If additional env vars are required, define and document them in this task.

Proposed env vars (if needed):

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Follow-up note:

- Add dedicated auth endpoint integration as a separate follow-up task after connectivity lands.

Acceptance criteria:

- Service can read DB connection settings from environment.
- Service can successfully connect to shared PostgreSQL in compose environment.

### E) Docker Compose Wiring (`compose.yaml` + `compose.watch.yaml`)

Changes:

- Rename service `backend` -> `game-backend`.
- Add service `randomizer-backend` with port mapping `3003:3003`.
- Ensure both services depend on shared `db` service as needed.
- Ensure frontend points to the intended API target (keep existing behavior unless explicitly changing target).

Acceptance criteria:

- `docker compose up --build` starts `game-backend`, `randomizer-backend`, `frontend`, and `db`.
- `GET /d6` is reachable on `localhost:3003`.
- Recreate flow (`down -v` then up) works cleanly after rename.

### F) CI Updates

Required changes:

- Add new workflow file: `randomizer-backend-lint` (path-filtered to `randomizer-backend/**` and its workflow file).
- Update `pr-ci.yml` to include `randomizer-backend` test/build job.

Job expectations for `randomizer-backend`:

- Install Python.
- Install dependencies.
- Run unit tests (`pytest`).
- Optional startup sanity check.
- Build container or validate app package as defined in task implementation.

Acceptance criteria:

- Randomizer lint workflow triggers only for relevant path changes.
- PR CI includes and passes randomizer test/build job.

## Risks and Checks

- Rename risk: hidden `backend/` path references in scripts/docs/workflows.
- Compose risk: service-name changes can break hostname references.
- CI risk: path filters or working-directory mismatches after rename.

Mitigation checklist:

- Global search for `backend/` and `service: backend` references.
- Fresh compose recreate test.
- Run both old-backend (renamed) and new-backend CI jobs locally where possible.

## Definition of Done

- `game-backend` rename is complete and functional.
- `randomizer-backend` exists, is linted/tested, and containerized.
- `GET /d6` returns plain integer 1-6.
- Randomizer service connects to shared DB.
- Compose files include both backends with expected ports.
- CI includes `randomizer-backend-lint` and PR CI randomizer test/build job.
- Follow-up for auth endpoint is explicitly tracked as a separate future task.
