CREATE TABLE helpers (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   private BOOLEAN NOT NULL DEFAULT true,
   name TEXT NOT NULL,
   logic JSON NOT NULL,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE helpers
   ADD CONSTRAINT helpers_pk
   PRIMARY KEY (id);

ALTER TABLE helpers
   ADD CONSTRAINT helpers_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX helpers_owner_name_idx ON helpers (owner_id, name);
CREATE INDEX helpers_owner_id_idx ON helpers (owner_id);
