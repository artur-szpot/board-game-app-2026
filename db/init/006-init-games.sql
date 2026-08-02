CREATE TABLE games (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   private BOOLEAN NOT NULL DEFAULT true,
   name TEXT NOT NULL,
   description TEXT,
   length GAME_LENGTH,
   min_players INTEGER,
   max_players INTEGER,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE games
   ADD CONSTRAINT games_pk
   PRIMARY KEY (id);

ALTER TABLE games
   ADD CONSTRAINT games_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX games_owner_name_idx ON games (owner_id, name);
CREATE INDEX games_owner_id_idx ON games (owner_id);
