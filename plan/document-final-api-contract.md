# 17 Document final API contract

## Description

Finalize the MVP API contract for the board-game app.

## Acceptance criteria

- `plan/dtos.md` is reviewed and finalized.
- `/game-api/` route shapes and payload definitions are confirmed.
- The API contract is accessible to frontend and backend implementers. (openAPI)

## Notes

This is a planning ticket and should be completed before larger frontend/backend work proceeds.

### 2026-07-31 update

- Decision: use OpenAPI as the single source of truth for API contract.
- Follow-up: create a separate implementation ticket to add and wire OpenAPI generation/maintenance into backend workflow.
