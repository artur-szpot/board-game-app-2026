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
- game-backend -> PostgreSQL (port 5432)
- randomizer-backend (port 3003) runs independently and can also use DB env settings

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
  - game modules: games, tags, locations, helpers, scoring-schemas, game-scores, search

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
  - /game-api/scoring-schemas
  - /game-api/game-scores
  - /game-api/search

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
- SQL files include schema, relation tables, and test-data loaders.
- Postgres data volume is persisted in docker volume db-volume.

## Known cross-layer coupling points

- DTO and payload shape alignment between frontend/src/dto and backend controllers/services.
- Pagination UI control is one-based, while frontend request state and backend pageNumber are zero-based.
- Domain entities with relation/link tables require careful merge/transform logic.

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

## AI-agent implementation checklist

1. Identify target service first.
2. Trace route -> controller -> service -> repository before edits.
3. Update DTOs and validators together when payloads change.
4. Run service-local tests after edits.
5. Update AGENTS or this file for new structural decisions.

## Open questions for maintainers

- Should randomizer-backend remain separate long-term or be folded into game-backend?
- What are the planned auth/role constraints per route for production hardening?
