CREATE TABLE game_scores (
   id VARCHAR(40) NOT NULL,
   game_id VARCHAR(40) NOT NULL,
   played_on TIMESTAMP(6),
   schema_id VARCHAR(40) NOT NULL,
   scores JSON,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_scores
   ADD CONSTRAINT game_scores_pk
   PRIMARY KEY (id);

ALTER TABLE game_scores
   ADD CONSTRAINT game_scores_game_fk
   FOREIGN KEY (game_id)
   REFERENCES games(id)
   ON DELETE CASCADE;

ALTER TABLE game_scores
   ADD CONSTRAINT game_scores_schema_fk
   FOREIGN KEY (schema_id)
   REFERENCES scoring_schemas(id)
   ON DELETE RESTRICT;

CREATE INDEX game_scores_game_id_idx ON game_scores (game_id);
CREATE INDEX game_scores_played_on_idx ON game_scores (played_on);
