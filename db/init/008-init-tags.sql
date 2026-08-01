CREATE TABLE tags (
   id VARCHAR(40) NOT NULL,
   name TEXT NOT NULL,
   description TEXT,
   parent_id VARCHAR(40),
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tags
   ADD CONSTRAINT tags_pk
   PRIMARY KEY (id);

CREATE UNIQUE INDEX tags_name_idx ON tags (name);

ALTER TABLE tags
   ADD CONSTRAINT tags_parent_fk
   FOREIGN KEY (parent_id)
   REFERENCES tags(id)
   ON DELETE SET NULL;

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

         SELECT t.id, t.parent_id, a.visited || t.id
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

CREATE TRIGGER tags_prevent_parent_cycle_trg
BEFORE INSERT OR UPDATE OF parent_id ON tags
FOR EACH ROW
EXECUTE FUNCTION prevent_tag_parent_cycle();
