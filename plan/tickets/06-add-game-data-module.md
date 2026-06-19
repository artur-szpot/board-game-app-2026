# 06 Add game data module

## Description
Implement the game backend module and expose CRUD endpoints for games.

## Acceptance criteria
- `GameModule`, `GameService`, `GameController`, and `GameRepository` exist.
- Endpoints are available under `/game-api/games` for GET, POST, PUT, DELETE.
- Response shapes follow `plan/dtos.md` for `GameDto`.
- Games can reference tags, locations, scoring schemas, and helpers.
- Relations are persisted correctly in join tables.

## Notes
This depends on locations, tags, scoring schemas, and helpers being available.
