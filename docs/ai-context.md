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
- Collection ownership scoping baseline: games, tags, locations, helpers, scoring schemas, and game scores are owner-scoped for non-superusers on reads; writes remain owner-bound.

## Frontend Frame Stack Notes

- Root behavior: Entity panels render inside FrameStackScreenWrapper. The top frame controls what is visible; SELF shows the original route screen, while OPTIONS/SEARCH/FORM replace it.
- State shape: frame stack Redux state stores serializable frame metadata only (frameType, params, callback token IDs). Real callback functions are kept outside Redux in frameCallbackRegistry.
- Bottom frame invariant: stack always has bottom SELF frame; only the top frame can be closed; bottom frame cannot be closed.
- Callback routing on close: closeFrame with a result sends that result to frame.callbackEmitter first, then falls back to the new top frame.callbackReceiver.
- Same-frame events: sameFrameResult emits to top frame callbackEmitter first, then callbackReceiver. This is used for in-place updates (for example selection edits/clear) without closing the frame.
- Lifecycle and cleanup: callback invocation and callback token cleanup happen in frameStackListeners middleware, not in reducers. Do not move callback execution into reducers.
- Reset behavior: resetToBottomFrame removes all nested frames and unregisters callbacks/custom mappings tied to removed frame IDs.
- Form custom mappings: form field customMapping functions are intentionally stripped before form frame params are stored in Redux and are kept in formScreenCustomMappingRegistry keyed by frameId.
- Form nested selections: FormScreen registers a receiver on the top frame and opens nested options/search frames with callbackEmitter so nested results can update parent form state.
- Critical pitfall: do not default callbackEmitter to a no-op. sameFrameResult checks emitter first; a default emitter can swallow updates meant for callbackReceiver.

## Maintenance Rules

- Add short bullet answers only.
- Prefer explicit examples over broad statements.
- When core behavior changes, sync key facts to AGENTS or docs/architecture.md.
