# OpenAPI Implementation Checklist

Goal: make OpenAPI the single source of truth for backend API contracts and frontend integration checks.

## Scope and ownership

- Owner: shared between backend and frontend maintainers.
- Initial scope: game-backend routes and DTOs.
- Secondary scope: reference usage for frontend API integration validation.

## Backend setup (NestJS)

- Add Nest Swagger dependencies in game-backend:
  - @nestjs/swagger
  - swagger-ui-express
- Configure Swagger in game-backend/src/main.ts:
  - Build a DocumentBuilder config (title, description, version, auth scheme).
  - Generate OpenAPI document from Nest app.
  - Expose docs route (for example /api-docs).
- Add bearer auth metadata and operation summaries to controllers where missing.

## Contract coverage tasks

- Annotate auth/admin controllers with response and request DTO metadata.
- Annotate game-api controllers with response and request DTO metadata.
- Ensure pagination request/response models are documented consistently.
- Ensure enum values used by FE are represented in schema.

## Validation workflow

- Add a script to generate or validate OpenAPI during CI (backend pipeline).
- Fail CI when DTO/controller changes are missing OpenAPI updates.
- Add a quick local command to preview generated docs.

## Frontend alignment workflow

- For backend DTO changes:
  - identify impacted route(s) in backend controllers,
  - find FE call-sites that use those routes,
  - verify payload/response compatibility,
  - update FE DTOs and mappers in the same PR.
- Keep route references consistent with docs/route-inventory.md.

## Done criteria for this ticket

- OpenAPI docs route is available in local dev.
- Core auth and game-api endpoints are documented.
- Team has a repeatable validation step in CI/local scripts.
- README and AGENTS link to OpenAPI workflow guidance.

## Follow-up tickets

- Tighten schema completeness (examples, error shapes, tags).
- Introduce codegen evaluation (optional) for FE types.
- Add release-phase backward-compatibility checks once public launch starts.
