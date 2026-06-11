# 02 Add location data module

## Description
Implement the location backend module and expose CRUD endpoints for locations.

## Acceptance criteria
- `LocationModule`, `LocationService`, `LocationController`, and `LocationRepository` exist.
- Endpoints are available under `/game-api/locations` for GET, POST, PUT, DELETE.
- Response shapes follow `plan/dtos.md` for `LocationResponse`.
- `name` is unique for locations.
- `parentId` validation prevents self-parenting and cycles.
- `isGameId` is stored and returned correctly.

## Notes
Locations should be available before game CRUD is implemented because games reference locations.
