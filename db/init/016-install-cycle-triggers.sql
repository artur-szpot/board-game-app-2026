CREATE OR REPLACE FUNCTION prevent_location_parent_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
   IF NEW.parent_id IS NULL THEN
      RETURN NEW;
   END IF;

   IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'Location cannot be its own parent';
   END IF;

   IF EXISTS (
      WITH RECURSIVE ancestors AS (
         SELECT l.id, l.parent_id, ARRAY[l.id]::VARCHAR(40)[] AS visited
         FROM locations l
         WHERE l.id = NEW.parent_id

         UNION ALL

         SELECT l.id, l.parent_id, (a.visited || l.id)::VARCHAR(40)[]
         FROM locations l
         JOIN ancestors a ON l.id = a.parent_id
         WHERE NOT l.id = ANY(a.visited)
      )
      SELECT 1
      FROM ancestors
      WHERE id = NEW.id
   ) THEN
      RAISE EXCEPTION 'Location parent relationship would create a cycle';
   END IF;

   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS locations_prevent_parent_cycle_trg ON locations;
CREATE TRIGGER locations_prevent_parent_cycle_trg
BEFORE INSERT OR UPDATE OF parent_id ON locations
FOR EACH ROW
EXECUTE FUNCTION prevent_location_parent_cycle();

CREATE OR REPLACE FUNCTION prevent_tag_parent_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
   IF NEW.parent_id IS NULL THEN
      RETURN NEW;
   END IF;

   IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'Tag cannot be its own parent';
   END IF;

   IF EXISTS (
      WITH RECURSIVE ancestors AS (
         SELECT t.id, t.parent_id, ARRAY[t.id]::VARCHAR(40)[] AS visited
         FROM tags t
         WHERE t.id = NEW.parent_id

         UNION ALL

         SELECT t.id, t.parent_id, (a.visited || t.id)::VARCHAR(40)[]
         FROM tags t
         JOIN ancestors a ON t.id = a.parent_id
         WHERE NOT t.id = ANY(a.visited)
      )
      SELECT 1
      FROM ancestors
      WHERE id = NEW.id
   ) THEN
      RAISE EXCEPTION 'Tag parent relationship would create a cycle';
   END IF;

   RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tags_prevent_parent_cycle_trg ON tags;
CREATE TRIGGER tags_prevent_parent_cycle_trg
BEFORE INSERT OR UPDATE OF parent_id ON tags
FOR EACH ROW
EXECUTE FUNCTION prevent_tag_parent_cycle();

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
            (r.visited || ggl.location_id)::VARCHAR(40)[]
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

DROP TRIGGER IF EXISTS game_game_locations_prevent_cycle_trg ON game_game_locations;
CREATE TRIGGER game_game_locations_prevent_cycle_trg
BEFORE INSERT OR UPDATE OF game_id, location_id ON game_game_locations
FOR EACH ROW
EXECUTE FUNCTION prevent_game_location_cycle();
