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

CREATE TABLE game_game_locations (
   game_id VARCHAR(40) NOT NULL,
   location_id VARCHAR(40) NOT NULL,
   note TEXT,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_game_locations
   ADD CONSTRAINT game_game_locations_pk
   PRIMARY KEY (game_id, location_id);

ALTER TABLE game_game_locations
   ADD CONSTRAINT game_game_locations_game_fk
   FOREIGN KEY (game_id)
   REFERENCES games(id)
   ON DELETE CASCADE;

ALTER TABLE game_game_locations
   ADD CONSTRAINT game_game_locations_location_fk
   FOREIGN KEY (location_id)
   REFERENCES games(id)
   ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION prevent_game_location_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
   IF NEW.game_id = NEW.location_id THEN
      RAISE EXCEPTION 'Game cannot reference itself as a location';
   END IF;

   IF EXISTS (
      WITH RECURSIVE reachable AS (
         SELECT
            ggl.game_id,
            ggl.location_id,
            ARRAY[ggl.game_id, ggl.location_id]::VARCHAR(40)[] AS visited
         FROM game_game_locations ggl
         WHERE ggl.game_id = NEW.location_id
           AND (
              TG_OP <> 'UPDATE'
              OR ggl.game_id <> OLD.game_id
              OR ggl.location_id <> OLD.location_id
           )

         UNION ALL

         SELECT
            ggl.game_id,
            ggl.location_id,
            r.visited || ggl.location_id
         FROM game_game_locations ggl
         JOIN reachable r ON ggl.game_id = r.location_id
         WHERE NOT ggl.location_id = ANY(r.visited)
           AND (
              TG_OP <> 'UPDATE'
              OR ggl.game_id <> OLD.game_id
              OR ggl.location_id <> OLD.location_id
           )
      )
      SELECT 1
      FROM reachable
      WHERE location_id = NEW.game_id
   ) THEN
      RAISE EXCEPTION 'Game location relationship would create a cycle';
   END IF;

   RETURN NEW;
END;
$$;

CREATE TRIGGER game_game_locations_prevent_cycle_trg
BEFORE INSERT OR UPDATE OF game_id, location_id ON game_game_locations
FOR EACH ROW
EXECUTE FUNCTION prevent_game_location_cycle();
