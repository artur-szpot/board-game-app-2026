-- Run with psql autocommit enabled: the enum value must commit before use.
ALTER TYPE permission_type ADD VALUE IF NOT EXISTS 'DATA_MANAGEMENT';

BEGIN;

INSERT INTO permissions (type, description)
VALUES ('DATA_MANAGEMENT', 'Allows viewing helper definitions and data sets (READ) and managing them (FULL)')
ON CONFLICT (type) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO roles_permissions (role_id, permission_type, permission_level)
VALUES
   ('admin', 'DATA_MANAGEMENT', 'FULL'),
   ('user', 'DATA_MANAGEMENT', 'READ')
ON CONFLICT (role_id, permission_type)
DO UPDATE SET permission_level = EXCLUDED.permission_level;

COMMIT;
