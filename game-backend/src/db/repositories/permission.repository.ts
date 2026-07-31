import { PermissionDto } from '@auth/modules/permissions/dto/in/permission.dto';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

export interface PermissionRepository {
  getPermissionByType(
    permissionType: PermissionType,
  ): Promise<PermissionDto | null>;
  getManyPermissions(dto?: GetManyItemsDto): Promise<PermissionDto[]>;
  getPermissionsCount(dto?: GetManyItemsDto): Promise<number>;
}

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');
