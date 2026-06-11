CREATE TABLE game_tags (
   game_id VARCHAR(40) NOT NULL,
   tag_id VARCHAR(40) NOT NULL,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_tags
   ADD CONSTRAINT game_tags_pk
   PRIMARY KEY (game_id, tag_id);

ALTER TABLE game_tags
   ADD CONSTRAINT game_tags_game_fk
   FOREIGN KEY (game_id)
   REFERENCES games(id)
   ON DELETE CASCADE;

ALTER TABLE game_tags
   ADD CONSTRAINT game_tags_tag_fk
   FOREIGN KEY (tag_id)
   REFERENCES tags(id)
   ON DELETE CASCADE;
