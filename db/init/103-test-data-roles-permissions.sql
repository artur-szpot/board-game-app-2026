INSERT INTO roles_permissions(
   role_id,
   permission_type,
   permission_level
)
VALUES (
   'admin',
   'USERS',
   'FULL'
), (
   'admin',
   'ROLES',
   'FULL'
), (
   'admin',
   'PERMISSIONS',
   'FULL'
), (
   'admin',
   'ADMIN_PANEL',
   'READ'
), (
   'admin',
   'COLLECTION_SUPERUSER',
   'READ'
), (
   'user',
   'GAME_COLLECTIONS',
   'FULL'
);
