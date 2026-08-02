import { PermissionDefinition } from '@auth/decorators/permissions.decorator';
import {
    PermissionLevel,
    PermissionPrecedence,
} from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

export const hasCollectionSuperuserPermission = (
  permissions: PermissionDefinition[] | undefined,
): boolean => {
  if (!permissions?.length) {
    return false;
  }

  const level = permissions.find(
    ([permissionType]) =>
      permissionType === PermissionType.COLLECTION_SUPERUSER,
  )?.[1];

  return (
    PermissionPrecedence.indexOf(level) >=
    PermissionPrecedence.indexOf(PermissionLevel.READ)
  );
};
