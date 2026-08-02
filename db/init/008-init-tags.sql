CREATE TABLE tags (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   private BOOLEAN NOT NULL DEFAULT true,
   name TEXT NOT NULL,
   description TEXT,
   parent_id VARCHAR(40),
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tags
   ADD CONSTRAINT tags_pk
   PRIMARY KEY (id);

ALTER TABLE tags
   ADD CONSTRAINT tags_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX tags_owner_name_idx ON tags (owner_id, name);
CREATE INDEX tags_owner_id_idx ON tags (owner_id);

ALTER TABLE tags
   ADD CONSTRAINT tags_parent_fk
   FOREIGN KEY (parent_id)
   REFERENCES tags(id)
   ON DELETE SET NULL;
