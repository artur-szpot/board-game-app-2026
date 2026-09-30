# AGENTS

This repository contains a board-game web app with three runtime services and one database.

## System at a glance

- frontend: React + Vite + TypeScript UI on port 3002
- game-backend: NestJS + TypeScript API on port 3001
- randomizer-backend: FastAPI + Python API on port 3003
- db: PostgreSQL 17 on port 5432, initialized from SQL files in db/init

## Local run commands

- Production-like compose: ./go
- Watch/dev compose: ./dev

These scripts run docker compose from the repository root.

## Service boundaries

- frontend calls game-backend as the primary app API
- frontend calls randomizer-backend directly (VITE_RANDOMIZER_URL) for helper randomization, teams and players; randomizer verifies game-backend JWTs with the shared AUTH_SECRET
- game-backend reads and writes PostgreSQL; randomizer-backend reads teams/players

## Backend route areas

- Auth and admin: auth, users, roles, permissions, admin/search
- Game domain: game-api/games, game-api/tags, game-api/locations, game-api/helpers, game-api/sets, game-api/translations, game-api/scoring-schemas, game-api/game-scores, game-api/search

## Frontend route areas

- /signin, /signup, /signout
- /admin/\*
- /collection/\* (including /collection/helpers/:id, the helper runner)

## Conventions for code changes

- Prefer minimal, targeted edits.
- Keep frontend DTO and backend payload shape aligned.
- When backend DTOs change, validate all affected frontend API calls in the same change.
- When backend DTOs/controllers change, regenerate and verify OpenAPI in the same change:
  - cd game-backend && npm run openapi:generate
  - cd game-backend && npm run openapi:check
- Preserve existing route prefixes and naming patterns.
- Avoid introducing new infrastructure or package managers unless required.

## OpenAPI route

- Swagger UI is served by game-backend at /api-docs in local dev.

## Frequent pitfalls

- Material UI pagination control is one-based, while frontend request state and backend pageNumber are zero-based.
- Some game relations use link tables with domain-specific merge logic.
- Be careful with callback function storage in frontend state management.

## Before merging major changes

- Run frontend tests and type checks.
- Run backend tests.
- Confirm compose services still boot.

## Human-maintained context

If behavior seems surprising, check project planning notes in plan/ and repository notes in /memories/repo/. Keep AGENTS updated when architecture or workflow changes.
