CREATE TABLE roles (
   id VARCHAR(40) NOT NULL,
   name TEXT UNIQUE NOT NULL,
   description TEXT NOT NULL,
   protected BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE roles 
   ADD CONSTRAINT roles_pk 
   PRIMARY KEY (id);
