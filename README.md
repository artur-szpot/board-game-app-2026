# Board Game App

Multi-service board-game application with a React frontend, a NestJS game backend, a FastAPI utility backend, and PostgreSQL.

## Quick Start

- Production-like compose run: ./go
- Watch/dev compose run: ./dev

## Services

- frontend: http://localhost:3002
- game-backend: http://localhost:3001
- randomizer-backend: http://localhost:3003
- postgres: localhost:5432

## Repository Guides

- Agent context and workflows: AGENTS.md
- AI assistant repository instructions: .github/copilot-instructions.md
- Architecture and policy baseline: docs/architecture.md
- AI context and operational assumptions: docs/ai-context.md
- API and route inventory snapshot: docs/route-inventory.md
- Architecture decision log: docs/decision-log.md
- Commit-safe secret templates: secrets.example/README.md
- OpenAPI implementation checklist: plan/openapi-implementation-checklist.md

## Contract Direction

OpenAPI is the intended single source of truth for API contracts. Implementation planning note is tracked in plan/document-final-api-contract.md.

## OpenAPI Workflow

- Docs route (local backend): http://localhost:3001/api-docs
- Generate spec: cd game-backend && npm run openapi:generate
- Contract check for CI: cd game-backend && npm run openapi:check
- Preview docs locally: cd game-backend && npm run openapi:preview

## PR Checklist (DTO or Route Changes)

- Backend DTO changed: verify affected frontend API call-sites in the same PR.
- Backend route changed: update frontend route/API usage and docs/route-inventory.md.
- Contract metadata updated: include matching OpenAPI updates.
- Behavior changed: update AGENTS.md or docs/architecture.md with new constraints.
