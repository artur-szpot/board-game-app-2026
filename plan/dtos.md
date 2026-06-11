# API DTOs (requests & responses)

This file proposes minimal request and response shapes for the MVP API derived from the table schemas and existing backend DTO patterns. Use these as the canonical frontend↔backend contract for planning and implementation.

Notes:
- `id` fields are strings (UUID or cuid) with max length ~40.
- Dates/timestamps use ISO 8601 strings.
- `createdOn` / `updatedOn` are present on responses for audit.

---

Common short types
- `GameShort`: { id: string, name: string }
- `TagShort`: { id: string, name: string }
- `LocationShort`: { id: string, name: string }
- `ScoringSchemaShort`: { id: string, name: string }
- `HelperShort`: { id: string, name: string }

---

1) Games

Request: CreateGameRequest
- name: string (required)
- description?: string
- length: "FILLER" | "SHORT" | "MEDIUM" | "LONG"
- tagIds?: string[]
- locationIds?: string[]
- scoringSchemaIds?: string[]
- helperIds?: string[]

Request: UpdateGameRequest
- id: string (required)
- any of the CreateGameRequest fields optional to patch

Response: GameResponse
- id: string
- name: string
- description?: string
- length?: string
- tags: TagShort[]
- locations: LocationShort[]
- scoringSchemas: ScoringSchemaShort[]
- helpers: HelperShort[]
- createdOn: string
- updatedOn: string

2) Locations

Request: CreateLocationRequest
- name: string (required)
- description?: string
- parentId?: string
- isGameId?: boolean (default false)

Request: UpdateLocationRequest
- id: string (required)
- fields to update as in Create

Response: LocationResponse
- id: string
- name: string
- description?: string
- parentId?: string
- isGameId: boolean
- createdOn: string
- updatedOn: string

3) Tags

Request: CreateTagRequest
- name: string (required)
- parentId?: string

Request: UpdateTagRequest
- id: string (required)
- fields to update

Response: TagResponse
- id: string
- name: string
- parentId?: string
- createdOn: string
- updatedOn: string

4) Helpers

Request: CreateHelperRequest
- name: string (required)
- logic: object (free-form JSON for MVP)

Request: UpdateHelperRequest
- id: string
- fields to update

Response: HelperResponse
- id: string
- name: string
- logic: object
- createdOn: string
- updatedOn: string

5) Scoring Schemas

Request: CreateScoringSchemaRequest
- name: string (required)
- schema: object (JSON describing expected `scores` structure)

Request: UpdateScoringSchemaRequest
- id: string
- fields to update (name or schema)

Response: ScoringSchemaResponse
- id: string
- name: string
- schema: object
- createdOn: string
- updatedOn: string

6) Game Scores (play sessions)

Request: CreateGameScoreRequest
- gameId: string (required)
- playedOn?: string (ISO) (default server now)
- schemaId: string (required) — links to `scoring_schemas` used
- scores: object with score entries matching schema. Example minimal shape for MVP:
	- scores: { [playerId]: { red: 1, blue: 2 } }

Response: GameScoreResponse
- id: string (suggest adding PK id to game_scores RESPONSE: added)
- gameId: string
- playedOn: string
- schema: JSON (from join to `scoring_schemas`)
- scores: object (as in request)
- createdOn: string
- updatedOn: string

7) Search endpoint

Request: SearchRequest
- q?: string (text query)
- types?: string[] (optional list of types to search; e.g. ["GAME","TAG","LOCATION"]) — when omitted, search default scope per endpoint
- pagination?: { page: number, perPage: number }
- filters?: object (keyed by type-specific fields)

Response: SearchResponse
- results: Array<{ type: string, item: object }> where `item` is the short response for the matched type (e.g. `GameShort`, `TagShort`)
- total: number
- page: number
- perPage: number

---

8) Example endpoint mapping (HTTP)
- GET /game-api/games?q=term —> SearchResponse with type=GAME results
- GET /game-api/games/:id —> GameResponse
- POST /game-api/games —> CreateGameRequest -> GameResponse
- PUT /game-api/games/:id —> UpdateGameRequest -> GameResponse
- DELETE /game-api/games/:id —> 204 No Content

Same pattern applies for `/game-api/locations`, `/game-api/tags`, `/game-api/helpers`, `/game-api/scoring-schemas`, `/game-api/game-scores`.

---

Validation notes (MVP)
- enforce required `name` fields and max lengths for strings.
- `scores` payload validated against `scoring_schema.schema` when schema exists; for MVP no validation needed; store as JSON.
- `parentId` must not equal `id` and backend should reject cycles (400) when creating/updating parent links.
