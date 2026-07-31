# Decision Log

Record architecture and workflow decisions here as short entries.

## Template

- Date: YYYY-MM-DD
- Decision: short title
- Context: why this was needed
- Choice: what was decided
- Impact: what changes now and later
- Follow-up: tickets or files to update

## Entries

- Date: 2026-07-31
- Decision: OpenAPI as API source of truth
- Context: frontend and backend contracts need one authoritative reference
- Choice: OpenAPI will be the single source of truth; implementation to be tracked separately
- Impact: endpoint and DTO changes should update OpenAPI once integrated
- Follow-up: add implementation ticket in planning workflow
