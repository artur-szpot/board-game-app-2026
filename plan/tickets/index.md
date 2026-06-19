# Ticket index for board-game-app MVP
| 07 | Add game score module | IN_REVIEW |
This index tracks the priority and completion status of discrete implementation tickets for the board-game app MVP.

| # | Ticket | Area | Status | Notes |
|---|---|---|---|---|
| 1 | Create DB migration and schema | Backend | DONE | Required before any data modules are built |
| 2 | Add location data module | Backend | DONE | Needed before game module because games reference locations |
| 3 | Add tag data module | Backend | DONE | Needed before game module because games reference tags |
| 4 | Add scoring schema module | Backend | DONE | Needed before game module and game score module |
| 5 | Add helper data module | Backend | DONE | Needed before game module because games reference helpers |
| 6 | Add game data module | Backend | DONE | Depends on tags, locations, scoring schemas, helpers |
| 7 | Add game score module | Backend | DONE | Depends on scoring schemas and games |
| 8 | Add search endpoint | Backend | TODO | Depends on searchable backend entities |
| 9 | Add backend tests for new modules | Backend | TODO | Can follow after backend modules are scaffolded |
| 10 | Implement frame stack navigation state | Frontend | TODO | Foundation for navigation and callback flow |
| 11 | Implement generic screen templates | Frontend | TODO | Required before screens are built |
| 12 | Implement locations and tags screens | Frontend | TODO | Use generic screens and backend endpoints |
| 13 | Implement games list/detail screens | Frontend | TODO | Depends on locations/tags data and generic screen support |
| 14 | Implement helpers and scoring schemas screens | Frontend | TODO | Placeholder content for MVP |
| 15 | Implement CRUD submission flows and delete confirmations | Frontend | TODO | Needed once screens and backend APIs exist |
| 16 | Implement search page and selection flow | Frontend | TODO | Uses shared search endpoint |
| 17 | Document final API contract | Planning | TODO | Freeze shapes in `plan/dtos.md` |
| 18 | Document frame callback model | Planning | TODO | Uses `plan/output/frame_action_spec.md` |
| 19 | Review MVP validation strategy | Planning | TODO | Keep minimal validation for MVP |
