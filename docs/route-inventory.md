# Route Inventory

Snapshot of route surfaces to help contributors and AI agents quickly map frontend usage to backend controllers.

## Frontend routes

Source: frontend/src/App.tsx

- /
- /signin
- /signup
- /signout
- /admin/permissions
- /admin/roles
- /admin/users
- /collection/games
- /collection/games/:id
- /collection/tags
- /collection/tags/:id
- /collection/locations
- /collection/locations/:id
- /collection/helpers
- /collection/scoring-schemas

## Game backend routes

### Auth and admin

- POST /auth/login
- POST /auth/signup
- GET /users/me
- GET /users/:id
- POST /users
- PATCH /users/:id
- DELETE /users/:id
- GET /roles/:id
- GET /roles/name/:name
- POST /roles
- PATCH /roles/:id
- DELETE /roles/:id
- GET /permissions/:permissionType
- POST /admin/search

### Game domain

- GET /game-api/games/:id
- POST /game-api/games
- PATCH /game-api/games/:id
- DELETE /game-api/games/:id
- GET /game-api/tags/:id
- POST /game-api/tags
- PATCH /game-api/tags/:id
- DELETE /game-api/tags/:id
- GET /game-api/locations/:id
- POST /game-api/locations
- PATCH /game-api/locations/:id
- DELETE /game-api/locations/:id
- GET /game-api/helpers/:id
- POST /game-api/helpers
- DELETE /game-api/helpers/:id
- GET /game-api/scoring-schemas/:id
- POST /game-api/scoring-schemas
- PATCH /game-api/scoring-schemas/:id
- DELETE /game-api/scoring-schemas/:id
- GET /game-api/game-scores/:id
- POST /game-api/game-scores
- PATCH /game-api/game-scores/:id
- DELETE /game-api/game-scores/:id
- POST /game-api/search

## Randomizer backend routes

- GET /d6

## Validation reminder

When backend controller routes or DTOs change, validate impacted frontend API calls in the same change.
