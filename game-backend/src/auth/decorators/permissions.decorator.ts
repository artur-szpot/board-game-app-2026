import { SetMetadata } from '@nestjs/common';

import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

export const PERMISSIONS_KEY = 'permissions';
export type PermissionDefinition = [PermissionType, PermissionLevel];
export const RequirePermissions = (...permissions: PermissionDefinition[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
