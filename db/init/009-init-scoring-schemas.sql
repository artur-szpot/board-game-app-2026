CREATE TABLE scoring_schemas (
   id VARCHAR(40) NOT NULL,
   name TEXT NOT NULL,
   schema JSON NOT NULL,
   created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE scoring_schemas
   ADD CONSTRAINT scoring_schemas_pk
   PRIMARY KEY (id);

CREATE UNIQUE INDEX scoring_schemas_name_idx ON scoring_schemas (name);
