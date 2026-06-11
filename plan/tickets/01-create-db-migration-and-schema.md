# 01 Create DB migration and schema

## Description
Add the database schema, migrations, and indexes required to support the MVP backend.

## Acceptance criteria
- Tables exist for `games`, `locations`, `tags`, `helpers`, `scoring_schemas`, `game_scores`, and join tables for many-to-many relationships.
- All tables include `createdOn` and `updatedOn` audit timestamp columns.
- `name` fields on searchable entities are unique and indexed.
- Foreign keys use cascade delete where appropriate.
- `game_scores` uses an explicit `id` primary key.
- Search-relevant columns are indexed (at least `name` on entities).

## Notes
This is the first backend task and should be completed before implementing the entity modules.
