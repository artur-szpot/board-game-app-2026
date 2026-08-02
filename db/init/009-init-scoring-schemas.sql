CREATE TABLE scoring_schemas (
   id VARCHAR(40) NOT NULL,
   owner_id VARCHAR(40) NOT NULL,
   private BOOLEAN NOT NULL DEFAULT true,
   name TEXT NOT NULL,
   schema JSON NOT NULL,
   description TEXT,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE scoring_schemas
   ADD CONSTRAINT scoring_schemas_pk
   PRIMARY KEY (id);

ALTER TABLE scoring_schemas
   ADD CONSTRAINT scoring_schemas_owner_fk
   FOREIGN KEY (owner_id)
   REFERENCES users(id)
   ON DELETE CASCADE;

CREATE UNIQUE INDEX scoring_schemas_owner_name_idx ON scoring_schemas (owner_id, name);
CREATE INDEX scoring_schemas_owner_id_idx ON scoring_schemas (owner_id);
