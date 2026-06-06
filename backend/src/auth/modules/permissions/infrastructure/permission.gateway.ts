import { Pagination } from '@common/pagination/pagination';

import { Paginated } from '@common/pagination/Paginated';
import { PermissionResponse } from '../dto/out/permission.response';
import { PermissionType } from '../enums/permission-type.enum';

export interface PermissionGateway {
  getByType(permissionType: PermissionType): Promise<PermissionResponse>;
  getMany(pagination?: Pagination): Promise<Paginated<PermissionResponse>>;
}

export const PERMISSION_GATEWAY = Symbol('PERMISSION_GATEWAY');
