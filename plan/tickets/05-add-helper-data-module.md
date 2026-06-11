# 05 Add helper data module

## Description
Implement the helper backend module and expose CRUD endpoints for helpers.

## Acceptance criteria
- `HelperModule`, `HelperService`, `HelperController`, and `HelperRepository` exist.
- Endpoints are available under `/game-api/helpers` for GET, POST, PUT, DELETE.
- Response shapes follow `plan/dtos.md` for `HelperResponse`.
- `logic` is stored as JSON and returned unchanged.

## Notes
Helpers should exist before game CRUD is implemented because games can reference helpers.
