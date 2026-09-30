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
      private BOOLEAN NOT NULL DEFAULT true,
      name TEXT NOT NULL,
      data JSON NOT NULL,
      created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
   );

ALTER TABLE sets ADD CONSTRAINT sets_pk PRIMARY KEY (id);

ALTER TABLE sets ADD CONSTRAINT sets_owner_fk FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE;

CREATE UNIQUE INDEX sets_owner_name_idx ON sets (owner_id, name);

CREATE INDEX sets_owner_id_idx ON sets (owner_id);

CREATE TABLE
   helper_sets (
      helper_id VARCHAR(40) NOT NULL,
      set_id VARCHAR(40) NOT NULL
   );

ALTER TABLE helper_sets ADD CONSTRAINT helper_sets_pk PRIMARY KEY (helper_id, set_id);

ALTER TABLE helper_sets ADD CONSTRAINT helper_sets_helper_fk FOREIGN KEY (helper_id) REFERENCES helpers (id) ON DELETE CASCADE;

-- Referenced sets cannot be deleted while any helper uses them.
ALTER TABLE helper_sets ADD CONSTRAINT helper_sets_set_fk FOREIGN KEY (set_id) REFERENCES sets (id) ON DELETE RESTRICT;

CREATE INDEX helper_sets_set_id_idx ON helper_sets (set_id);