import { PermissionDefinition } from '@auth/decorators/permissions.decorator';
import {
  PermissionLevel,
  PermissionPrecedence,
} from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

export const hasRequiredPermission = (
  permissions: PermissionDefinition[],
  type: PermissionType,
  level: PermissionLevel,
): boolean => {
  const granted = permissions.find(([permission]) => permission === type)?.[1];
  return (
    PermissionPrecedence.indexOf(granted) >= PermissionPrecedence.indexOf(level)
  );
};
