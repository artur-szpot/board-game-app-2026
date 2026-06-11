# 07 Add game score module

## Description
Implement the game score backend module and expose CRUD endpoints for game scores.

## Acceptance criteria
- `GameScoreModule`, `GameScoreService`, `GameScoreController`, and `GameScoreRepository` exist.
- Endpoints are available under `/game-api/game-scores` for GET, POST, PUT, DELETE.
- `game_scores` uses an explicit `id` primary key.
- Response shapes follow `plan/dtos.md` for `GameScoreResponse`.
- `schemaId`, `playedOn`, and `scores` JSON are handled correctly.

## Notes
This depends on game and scoring schema entities.
