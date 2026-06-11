CREATE TABLE game_scoring_schemas (
   game_id VARCHAR(40) NOT NULL,
   schema_id VARCHAR(40) NOT NULL,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_scoring_schemas
   ADD CONSTRAINT game_scoring_schemas_pk
   PRIMARY KEY (game_id, schema_id);

ALTER TABLE game_scoring_schemas
   ADD CONSTRAINT game_scoring_schemas_game_fk
   FOREIGN KEY (game_id)
   REFERENCES games(id)
   ON DELETE CASCADE;

ALTER TABLE game_scoring_schemas
   ADD CONSTRAINT game_scoring_schemas_schema_fk
   FOREIGN KEY (schema_id)
   REFERENCES scoring_schemas(id)
   ON DELETE CASCADE;
