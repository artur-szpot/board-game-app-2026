CREATE TABLE teams (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   private BOOLEAN NOT NULL DEFAULT true,
   name TEXT NOT NULL
);

ALTER TABLE teams
   ADD CONSTRAINT teams_pk
   PRIMARY KEY (id);

ALTER TABLE teams
   ADD CONSTRAINT teams_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX teams_owner_name_idx ON teams (owner_id, name);
CREATE INDEX teams_owner_id_idx ON teams (owner_id);

CREATE TABLE players (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   name TEXT NOT NULL
);

ALTER TABLE players
   ADD CONSTRAINT players_pk
   PRIMARY KEY (id);

ALTER TABLE players
   ADD CONSTRAINT players_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX players_owner_name_idx ON players (owner_id, name);
CREATE INDEX players_owner_id_idx ON players (owner_id);

CREATE TABLE team_players (
   team_id VARCHAR(40) NOT NULL,
   player_id VARCHAR(40) NOT NULL
);

ALTER TABLE team_players
   ADD CONSTRAINT team_players_pk
   PRIMARY KEY (team_id, player_id);

ALTER TABLE team_players
   ADD CONSTRAINT team_players_team_fk
   FOREIGN KEY (team_id)
   REFERENCES teams(id)
   ON DELETE CASCADE;

ALTER TABLE team_players
   ADD CONSTRAINT team_players_player_fk
   FOREIGN KEY (player_id)
   REFERENCES players(id)
   ON DELETE CASCADE;



CREATE TABLE translations (
   id VARCHAR(40) NOT NULL,
   label TEXT NOT NULL,
   language TEXT NOT NULL,
   value TEXT NOT NULL
);

ALTER TABLE translations
   ADD CONSTRAINT translations_pk
   PRIMARY KEY (id);

CREATE UNIQUE INDEX translations_label_language_idx
   ON translations (label, language);