CREATE TABLE users_roles (
   user_id VARCHAR(40) NOT NULL,
   role_id VARCHAR(40) NOT NULL
);

ALTER TABLE users_roles 
   ADD CONSTRAINT users_roles_pk 
   PRIMARY KEY (user_id, role_id);
ALTER TABLE users_roles 
   ADD CONSTRAINT users_roles_fk_user
   FOREIGN KEY(user_id) 
   REFERENCES users(id)
   ON DELETE CASCADE;
ALTER TABLE users_roles 
   ADD CONSTRAINT users_roles_fk_role
   FOREIGN KEY(role_id) 
   REFERENCES roles(id)
   ON DELETE CASCADE;
