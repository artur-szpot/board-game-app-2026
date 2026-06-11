# 08 Add search endpoint

## Description
Implement the shared search API endpoint for the MVP.

## Acceptance criteria
- `GET /game-api/search` exists.
- `type` query parameter is required, accepts an array, and must include at least one item.
- Supports `q`, `pagination`, and optional `filters`.
- Returns combined results with `type` and short item payloads.
- Uses short response shapes such as `GameShort`, `TagShort`, and `LocationShort`.

## Notes
This endpoint can be implemented after core searchable entity modules exist.
