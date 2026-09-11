CREATE TABLE
   game_helpers (
      game_id VARCHAR(40) NOT NULL,
      helper_id VARCHAR(40) NOT NULL,
      helper_args JSON,
      created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );

ALTER TABLE game_helpers ADD CONSTRAINT game_helpers_pk PRIMARY KEY (game_id, helper_id);

ALTER TABLE game_helpers ADD CONSTRAINT game_helpers_game_fk FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE;

ALTER TABLE game_helpers ADD CONSTRAINT game_helpers_helper_fk FOREIGN KEY (helper_id) REFERENCES helpers (id) ON DELETE CASCADE;

CREATE TABLE
   sets (
      id VARCHAR(40) NOT NULL,
      owner_id VARCHAR(40) NOT NULL,
      name TEXT NOT NULL,
      data JSON NOT NULL
   );

ALTER TABLE sets ADD CONSTRAINT sets_pk PRIMARY KEY (id);

ALTER TABLE sets ADD CONSTRAINT sets_owner_fk FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE;

CREATE UNIQUE INDEX sets_owner_name_idx ON sets (owner_id, name);

CREATE INDEX sets_owner_id_idx ON sets (owner_id);