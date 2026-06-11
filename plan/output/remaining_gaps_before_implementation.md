# Remaining Gaps Before Implementation

This document lists the unresolved design decisions and missing artifacts that should be resolved before producing a full implementation plan and work breakdown.

## Resolved clarifications
- Use `/game-api/` prefix for all endpoint routes.
- `game_scores` should include an explicit `id` primary key.
- Use a single search endpoint at `/game-api/search`.
  - `type` is mandatory and must be an array with at least one element.
- Minimal validation is sufficient for MVP.
- Document `OPEN_FRAME` / `CLOSE_FRAME` behavior in `plan/output/frame_action_spec.md`.

## Priority decisions (blockers for a reliable implementation plan)
- API contract / DTO definitions
  - Define request and response shapes for: `games`, `locations`, `tags`, `helpers`, `scoring_schemas`, `game_scores` and search endpoints.
  RESPONSE: see created dtos.md
  - Standardize ID format and error payload shape (HTTP status + JSON error body).
  RESPONSE: use simple standard for now
- CRUD endpoints and routes
  - Confirm exact routes and verbs (e.g., `GET /api/games`, `POST /api/games`, `PUT /api/games/:id`, `DELETE /api/games/:id`).
  RESPONSE: confirmed in dtos.md, e.g. /game-api/games/:id
- Database schema finalization
  - Add explicit `createdOn` / `updatedOn` columns to all tables and choose timezone strategy.
  RESPONSE: yes, please add. Save in UTC always.
  - Define uniqueness constraints (e.g., unique `name` per entity where required) and FK cascade/delete rules (currently suggested: cascade on delete).
  RESPONSE: cascade on delete, unique name per table, other columns don't need uniqueness
  - Finalize `game_scores` shape: confirm `scores` JSON format and whether players are stored as structured rows or JSON.
  RESPONSE: short response in dtos.md, skip complexity for now.
  - Confirm scoring schema immutability and relation model (how `game_scores.schema` links to `scoring_schemas`).
  RESPONSE: for MVP the minimal shape we have in place will suffice.
- Indexing and search strategy
  - Decide which columns will be indexed (e.g., `name`, `description`) and whether to use full-text search or simple `ILIKE` filters.
  RESPONSE: index on names only, other columns don't need it for now.

## Important design choices (must be decided, but can be lightweight for MVP)
- Window stack semantics
  - Define the persisted shape for an open frame (what to store: frame type, params, pending callback id, return mapping).
  RESPONSE: frame type fed from an enum (SEARCH, OPTIONS, FORM), currently pending callback, params (a common Props object for all frame types, form status (in case it was dirtied already))
  - Confirm how `OPEN_FRAME`/`CLOSE_FRAME` actions carry callbacks; concretely define the callback payload format.
  RESPONSE: CLOSE_FRAME: include return state of a frame being closed to use in the saved callback'; OPEN_FRAME: save relevant callback in the "old" frame
- Error, loading, and empty states
  - Standardize loading UX patterns and API error handling contract so frontend components behave consistently.
  RESPONSE: yes, please include a loader component like <p>Loading...</p>
- Validation strategy
  - Decide minimal server-side validation rules and an approach for form-level validation (MVP: basic required checks; later: richer validators).
  RESPONSE: allow passthrough for now
- Delete strategy
  - Confirm hard delete for MVP (user responded yes). Add required confirmation behavior on frontend.
  RESPONSE: yes, hard delete with popup before enacting deletion from the UI

## Backend implementation & infra
- CRUD modules and responsibilities
  - For each entity, specify whether a full module/service/controller/repository will be scaffolded prior to frontend work.
  RESPONSE: separate repository, service, controller and module per entity type (e.g. GameTagModule). Overarching module for all entity types (GameModule)
- Migrations and seeds
  - Prepare DB migration plan and minimal seed data (game lengths, initial scoring schemas, sample games) for local dev and tests.
  RESPONSE: prepare table creation and enums. No initial data to be loaded for now.
- Testing expectations
  - Decide minimal automated tests to require before merging: API smoke tests and basic repository tests.
  RESPONSE: standard unit test coverage for created files will be enough for now.

## UX and screens (remaining concrete clarifications)
- Unspecified screens to finalize
  - `SCOREPAD` and `HELPER`: confirm MVP content and API interactions (user indicated placeholder content is OK for MVP).
  RESPONSE: for now a placeholder string on these screens is enough
- Form behavior
  - Explicit `BACK` / `CONFIRM` / `SHUFFLE` semantics: confirm when `CONFIRM` is enabled and what `BACK` returns (undefined).
  RESPONSE: BACK = close frame with no return (callback should not fire on it); SHUFFLE - disabled for forms; CONFIRM = close frame, returning data from the form, actionable once form is dirty and data in it is validated as correct (validation can use a placeholder "return true" for now)
- Search behavior
  - Confirm whether pagination or remote-limit is required for lists (user opted no pagination for MVP).
  RESPONSE: for MVP pagination as requested through the API is enough

## Non-blocking / deferred items (record decisions, not blockers)
- Accessibility, keyboard navigation, responsive/mobile layout (deferred).
- Analytics / event hooks (deferred).
- Rich helper logic expansion and schema versioning (deferred).

## Deliverables to produce before implementation planning
- A minimal API spec (OpenAPI or plain markdown) covering endpoints + DTOs for all entities and search.
- Final DB schema SQL or migration files including indexes, FK constraints, and audit fields.
- A short document defining `OPEN_FRAME` / `CLOSE_FRAME` payload format and callback mapping behavior.
- Seed data and a minimal test plan (API smoke tests) RESPONSE: deferred for MVP

## Suggested immediate next steps
1. Author the minimal API spec (required).  
2. Produce DB migration SQL based on the finalized schema.  
3. Draft the `frame` action payload spec so frontend/backlog planning can reference concrete shapes.  

Resolve the Priority decisions above and provide the API DTOs and frame payload spec; once those are available I can convert the remaining items into a prioritized implementation plan with tasks, estimates, and tests.
