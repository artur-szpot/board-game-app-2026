import { PermissionDto } from '@auth/modules/permissions/dto/in/permission.dto';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { Pagination } from '@common/pagination/pagination';

export interface PermissionRepository {
  getPermissionByType(
    permissionType: PermissionType,
  ): Promise<PermissionDto | null>;
  getManyPermissions(pagination?: Pagination): Promise<PermissionDto[]>;
  getAllPermissionsCount(): Promise<number>;
}

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');
