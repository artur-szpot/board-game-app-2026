# 03 Add tag data module

## Description
Implement the tag backend module and expose CRUD endpoints for tags.

## Acceptance criteria
- `TagModule`, `TagService`, `TagController`, and `TagRepository` exist.
- Endpoints are available under `/game-api/tags` for GET, POST, PUT, DELETE.
- Response shapes follow `plan/dtos.md` for `TagResponse`.
- `name` is unique for tags.
- `parentId` validation prevents self-parenting and cycles.

## Notes
Tags should be available before game CRUD is implemented because games reference tags.
