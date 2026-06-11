CREATE TABLE game_locations (
   game_id VARCHAR(40) NOT NULL,
   location_id VARCHAR(40) NOT NULL,
   note TEXT,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_locations
   ADD CONSTRAINT game_locations_pk
   PRIMARY KEY (game_id, location_id);

ALTER TABLE game_locations
   ADD CONSTRAINT game_locations_game_fk
   FOREIGN KEY (game_id)
   REFERENCES games(id)
   ON DELETE CASCADE;

ALTER TABLE game_locations
   ADD CONSTRAINT game_locations_location_fk
   FOREIGN KEY (location_id)
   REFERENCES locations(id)
   ON DELETE CASCADE;
