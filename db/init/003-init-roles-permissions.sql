CREATE TYPE PERMISSION_LEVEL
   AS ENUM (
      'READ',
      'FULL'
   );

CREATE TABLE roles_permissions (
   role_id VARCHAR(40) NOT NULL,
   permission_type PERMISSION_TYPE NOT NULL,
   permission_level PERMISSION_LEVEL NOT NULL
);

ALTER TABLE roles_permissions 
   ADD CONSTRAINT roles_permissions_pk 
   PRIMARY KEY (role_id, permission_type);
ALTER TABLE roles_permissions 
   ADD CONSTRAINT roles_permissions_fk_role
   FOREIGN KEY(role_id) 
   REFERENCES roles(id)
   ON DELETE CASCADE;
ALTER TABLE roles_permissions 
   ADD CONSTRAINT roles_permissions_fk_permission
   FOREIGN KEY(permission_type) 
   REFERENCES permissions(type)
   ON DELETE CASCADE;
