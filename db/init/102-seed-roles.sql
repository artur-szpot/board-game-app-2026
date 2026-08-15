INSERT INTO roles(
   id,
   name,
   description,
   protected
)
VALUES (
   'admin',
   'Admin',
   'Grants administrative access to the application',
   true
), (
   'user',
   'User',
   'Grants access to the main functionality of the application',
   true
);
