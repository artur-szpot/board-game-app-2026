import { PermissionDefinition } from '@auth/decorators/permissions.decorator';
import {
    PermissionLevel,
    PermissionPrecedence,
} from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

export const hasSystemCollectionFullPermission = (
  permissions: PermissionDefinition[] | undefined,
): boolean => {
  const level = permissions?.find(
    ([permissionType]) => permissionType === PermissionType.SYSTEM_COLLECTION,
  )?.[1];

  return (
    PermissionPrecedence.indexOf(level) >=
    PermissionPrecedence.indexOf(PermissionLevel.FULL)
  );
};
