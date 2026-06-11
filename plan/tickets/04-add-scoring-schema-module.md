# 04 Add scoring schema module

## Description
Implement the scoring schema backend module and expose CRUD endpoints for scoring schemas.

## Acceptance criteria
- `ScoringSchemaModule`, `ScoringSchemaService`, `ScoringSchemaController`, and `ScoringSchemaRepository` exist.
- Endpoints are available under `/game-api/scoring-schemas` for GET, POST, PUT, DELETE.
- Response shapes follow `plan/dtos.md` for `ScoringSchemaResponse`.
- The schema JSON is stored and returned intact.

## Notes
Scoring schemas should exist before game CRUD and game score CRUD are implemented.
