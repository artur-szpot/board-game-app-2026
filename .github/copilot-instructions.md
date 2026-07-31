# Copilot instructions for board-game-app

## Intent

Help contributors and AI agents make safe, incremental changes with correct cross-service assumptions.

## High-priority rules

- Do not edit files in secrets/ unless explicitly requested.
- Use files in secrets.example/ as templates; never commit real secrets.
- Prefer docker-compose-driven workflows through ./go and ./dev.
- Keep API contracts consistent between frontend DTOs and backend controllers.
- Avoid broad refactors unless requested.

## Stack summary

- frontend: React 19, Vite 6, TypeScript, Redux Toolkit, Material UI
- game-backend: NestJS 10, TypeScript, PostgreSQL via pg
- randomizer-backend: FastAPI, psycopg
- database: PostgreSQL 17 initialized from db/init

## Route and module orientation

- frontend routing is centralized in frontend/src/App.tsx.
- backend modules are composed in game-backend/src/app.module.ts.
- game APIs use the game-api/ prefix.

## Change strategy

- Start with local context files: AGENTS and docs/architecture.md.
- Treat OpenAPI as the target single source of truth for API contracts.
- Keep edits small and verify impacted tests for the touched service.
- If uncertain about domain assumptions, record clarifications in docs/ai-context.md.

## Testing expectations

- frontend: npm run test, npm run type-check, npm run lint when relevant
- backend: npm run test
- python service: pytest

## Documentation hygiene

When adding or changing core behavior, update at least one of:

- AGENTS
- docs/architecture.md
- docs/ai-context.md
