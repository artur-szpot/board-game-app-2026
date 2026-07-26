CREATE TABLE locations (
   id VARCHAR(40) NOT NULL,
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

CREATE UNIQUE INDEX locations_name_idx ON locations (name);

ALTER TABLE locations
   ADD CONSTRAINT locations_parent_fk
   FOREIGN KEY (parent_id)
   REFERENCES locations(id)
   ON DELETE SET NULL;
