# Architecture Overview

## Monorepo layout

- frontend/: React + Vite user interface
- game-backend/: NestJS API for auth and game-domain CRUD/search
- randomizer-backend/: FastAPI utility service
- db/init/: ordered SQL bootstrap and test-data scripts
- plan/: product and implementation notes

## Runtime topology

- User browser -> frontend (port 3002)
- frontend -> game-backend (port 3001)
- frontend -> randomizer-backend (port 3003, CORS + game-backend JWT) for helper randomization, teams and players
- game-backend -> PostgreSQL (port 5432)
- randomizer-backend -> PostgreSQL (read-only teams/players)

## Compose entrypoints

- compose.yaml: standard container run
- compose.watch.yaml: live-reload development run
- ./go: wrapper script for compose.yaml
- ./dev: wrapper script for compose.watch.yaml

## Backend architecture

- Framework: NestJS with global validation pipe and CORS enabled.
- Main composition: game-backend/src/app.module.ts
- Core module areas:
  - auth module
  - db module
  - game modules: games, tags, locations, helpers, sets, translations, scoring-schemas, game-scores, search

### Backend API families

- Auth/admin routes:
  - /auth/login
  - /auth/signup
  - /users/\*
  - /roles/\*
  - /permissions/\*
  - /admin/search
- Game routes:
  - /game-api/games
  - /game-api/tags
  - /game-api/locations
  - /game-api/helpers
  - /game-api/sets
  - /game-api/translations
  - /game-api/scoring-schemas
  - /game-api/game-scores
  - /game-api/search

### Collection filters

- `POST /game-api/search` accepts `filters` as a flat `Record<string, string>` map; the games
  repository understands `playerCount`, `tagIds`, `locationIds`, `hasHelpers` and `length`.
- `tagIds` and `locationIds` are comma-separated id lists with match-ALL semantics; `locationIds`
  matches both `game_locations` and `game_game_locations` links.
- Games with a missing `min_players`/`max_players` bound match any `playerCount`.
- Unsupported filter keys and invalid values are ignored, like unsupported sort keys.
- The frontend stores active filters in the URL as `f_<key>` parameters; changing a filter resets
  pagination, and switching collection tabs clears them.

### Scoring

- `scoring_schemas.schema` holds a versioned JSONB definition with a strict three-level shape:
  groups -> categories -> rows. Each group carries a mechanism (SUM_ALL, SUM_ALL_PLUS_SMALLEST,
  GREATEST_ONLY, SMALLEST_ONLY) applied over its category subtotals; a category subtotal is the sum of
  its rows; a row needs a name whenever no icon is set.
- The shape is validated at the API boundary by nested class-validator DTOs under
  game-backend/src/games/scoring-schemas/dto/schema.
- `game_scores.scores` stores only raw input: `{ players, values }` where values maps rowId -> player ->
  number. Subtotals and totals are never persisted; they are recomputed on read by
  frontend/src/utils/score-calculation.ts.
- `game_scores` has no schema column of its own; reads join `scoring_schemas` through `schema_id`.

### Helpers

- `helpers.logic` is a versioned step list (team-and-players, single-select, multi-select, roll, deal, display)
  validated by game-backend/src/games/helpers/logic/helper-logic.validator.ts on create/update.
- Helpers reference `sets` by ID; `helper_sets` link rows (rewritten in the helper write transaction) block set deletion.
- Labels are i18n tuples resolved by `POST /game-api/translations/lookup` with per-key English fallback.
- The runner is stateless on the server: frontend/src/components/helper-runner drives steps client-side and calls
  randomizer-backend `/dice`, `/choose`, `/teams` and `/players` directly.

## Frontend architecture

- Framework: React 19 + React Router + Redux Toolkit + Material UI
- Routing entry: frontend/src/App.tsx
- Major route groups:
  - auth routes: /signin, /signup, /signout
  - admin routes under /admin
  - collection routes under /collection
  - game details route under /collection/games/:id

### Frontend frame stack subsystem

- Purpose: route-local frame navigation for modal-like flows (form/options/search) without leaving the current page route.
- Renderer: FrameStackScreenWrapper switches on top frame type. SELF renders original route content; OPTIONS/SEARCH/FORM render the corresponding frame screen.
- Storage model:
  - Redux frameStack slice stores only serializable frame data and callback token IDs.
  - Callback functions are stored in frameCallbackRegistry and referenced by token.
  - Form field customMapping functions are stored in formScreenCustomMappingRegistry keyed by frameId, not in Redux state.
- Core actions:
  - openOptionsFrame/openSearchFrame/openFormFrame push new top frame.
  - openGameDetailsFrame pushes a game details frame that can be opened from route or frame contexts.
  - openScoringSchemaEditorFrame and openScoreEntryFrame push the scoring screens, which hold their own
    draft state because their shapes are too dynamic for the generic FormScreen field descriptors.
  - closeFrame pops only the current top frame and can carry a typed result payload.
  - sameFrameResult emits typed result payload on the current frame without stack changes.
  - resetToBottomFrame collapses stack to SELF.
- Callback resolution rules:
  - closeFrame result: invoke closing frame callbackEmitter if present, otherwise new top frame callbackReceiver.
  - sameFrameResult: invoke top frame callbackEmitter if present, otherwise top frame callbackReceiver.
- Lifecycle management:
  - frameStackListeners middleware performs callback invocation and unregisters callback tokens for removed frames.
  - The same middleware clears form custom mapping registry entries for removed frame IDs.
  - Reducers remain pure and do not invoke callbacks directly.
- Behavioral invariants:
  - Bottom SELF frame always exists.
  - Non-top frames cannot be closed.
  - Bottom frame cannot be closed.

## Data and persistence

- DB bootstrap runs from db/init in filename order.
- Cycle prevention is enforced by game-backend services rather than database triggers or Compose startup checks.
- SQL files include schema, relation tables, and test-data loaders.
- Randomizer persistence includes owner-scoped teams, players, and team-player links; team deletion cascades to links but retains player records.
- Postgres data volume is persisted in docker volume db-volume.

## Known cross-layer coupling points

- DTO and payload shape alignment between frontend/src/dto and backend controllers/services.
- Pagination UI control is one-based, while frontend request state and backend pageNumber are zero-based.
- Domain entities with relation/link tables require careful merge/transform logic.

## Error handling

- Services throw the named errors from `@common/errors/service-errors`: `CustomBadRequestError`,
  `CustomForbiddenError`, `CustomNotFoundError`, `CustomConflictError`, `CustomUnauthorizedError`
  and `CustomInternalError`. They extend the matching Nest exceptions, so `instanceof` guards and
  status codes are unchanged.
- `CustomBadRequestError` accepts one message or many and always responds with a message array.
- `BadRequestShapeFilter` (registered globally in main.ts) normalizes every 400 response to
  `{ statusCode, message: string[], error, path, timestamp }`, which is what
  `ValidationErrorResponseDto` documents; other statuses pass through untouched.
- The frontend wraps its routes in `ErrorBoundary`, keyed by location so navigation recovers a
  crashed screen.

## Contract and release policy

- API contract single source of truth: OpenAPI (Swagger UI at /api-docs, generated spec at game-backend/openapi/openapi.json).
- Validation workflow: run game-backend openapi:generate and openapi:check for DTO/controller changes.
- CI enforcement: .github/workflows/openapi-check.yml runs openapi:check when game-backend files change.
- Before public release: breaking API changes are acceptable and backward compatibility is not required.
- Change validation rule: backend DTO changes must be checked against existing frontend calls for impacted routes.

## Auth policy baseline

- Public routes are auth endpoints only (for example login/signup).
- All non-auth endpoints require authentication.
- Authorization is endpoint-specific and uses permissions granted through user roles.
- `SYSTEM_COLLECTION:FULL` controls creation and mutation of shared SYSTEM-owned tags, helpers, and scoring schemas.

## Shared collection records

- `SYSTEM` is a reserved user row so shared records retain the existing collection owner foreign keys.
- Ordinary collection reads include records owned by the current user and records owned by `SYSTEM`.
- Resource-local `/system` POST routes create public SYSTEM records for helpers and scoring schemas; tags now use the standard create route with a `public` flag to create a public SYSTEM-owned record. Existing mutation routes still enforce the additional SYSTEM permission based on the loaded record owner.

## AI-agent implementation checklist

1. Identify target service first.
2. Trace route -> controller -> service -> repository before edits.
3. Update DTOs and validators together when payloads change.
4. Run service-local tests after edits.
5. Update AGENTS or this file for new structural decisions.

## Open questions for maintainers

- Should randomizer-backend remain separate long-term or be folded into game-backend?
- What are the planned auth/role constraints per route for production hardening?
