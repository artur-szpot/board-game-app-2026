CREATE TABLE locations (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   private BOOLEAN NOT NULL DEFAULT true,
   name TEXT NOT NULL,
   description TEXT,
   parent_id VARCHAR(40),
   path TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
   path_ids VARCHAR(40)[] NOT NULL DEFAULT ARRAY[]::VARCHAR(40)[],
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE locations
   ADD CONSTRAINT locations_pk
   PRIMARY KEY (id);

ALTER TABLE locations
   ADD CONSTRAINT locations_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX locations_owner_name_idx ON locations (owner_id, name);
CREATE INDEX locations_owner_id_idx ON locations (owner_id);

ALTER TABLE locations
   ADD CONSTRAINT locations_parent_fk
   FOREIGN KEY (parent_id)
   REFERENCES locations(id)
   ON DELETE SET NULL;

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

         SELECT l.id, l.parent_id, a.visited || l.id
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

CREATE TRIGGER locations_prevent_parent_cycle_trg
BEFORE INSERT OR UPDATE OF parent_id ON locations
FOR EACH ROW
EXECUTE FUNCTION prevent_location_parent_cycle();
