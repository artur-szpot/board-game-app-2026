# AI Context

Use this file to capture operational context, decisions, and any remaining unknowns for contributors and AI agents.

## Policy Baseline

- API contract source of truth:
  - Current source is: OpenAPI.
  - Owner is: shared between backend and frontend maintainers.
  - Update process is: implement OpenAPI as a separate ticket, then require DTO/endpoint changes to update the OpenAPI contract in the same change.

- Auth and authorization policy:
  - Public routes: auth endpoints only (for example /auth/login and /auth/signup).
  - Auth-required routes: all non-auth endpoints.
  - Admin-only routes: endpoint-specific, enforced by permissions derived from user roles.

- Environment expectations:
  - Required env variables by service:
    - game-backend: AUTH_SECRET, PORT, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, NODE_ENV.
    - randomizer-backend: uses backend env values when DB connectivity check is needed; PORT is configured via compose.
    - frontend: VITE_API_URL is configured in compose and not sourced from committed secrets files.
  - Required secrets management approach: do not commit real secrets; populate local files under secrets/ from templates in secrets.example/.

- Database migration approach:
  - Is db/init append-only? no, not yet.
  - How are breaking schema changes handled? direct breaking changes are acceptable for now, without backward-compatible migrations, until public release hardening.

- Frontend-backend versioning policy:
  - How to coordinate payload changes: when backend DTOs change, validate affected frontend calls by matching backend controller routes and payload contracts against frontend route/API usage.
  - Backward compatibility expectations: not required for now.

## Validated Assumptions

- Pagination mapping note: Material UI Pagination is one-based for display, while frontend request state and backend pageNumber are zero-based. Convert with +1/-1 at the UI boundary.
- game-api prefixes are stable and should not be renamed.
- randomizer-backend is intentionally lightweight and isolated.

## Maintenance Rules

- Add short bullet answers only.
- Prefer explicit examples over broad statements.
- When core behavior changes, sync key facts to AGENTS or docs/architecture.md.
