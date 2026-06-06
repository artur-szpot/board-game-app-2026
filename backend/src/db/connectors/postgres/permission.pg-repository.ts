import { Injectable } from '@nestjs/common';

import { PermissionDto } from '@auth/modules/permissions/dto/in/permission.dto';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { Pagination } from '@common/pagination/pagination';
import { DbSearchDto } from '@db/dto/search.dto';

import { PermissionRepository } from '../../repositories/permission.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresPermissionRepository implements PermissionRepository {
  private SELECT_PERMISSIONS_SQL = (args?: DbSearchDto): string => `
   SELECT
      description,
      type as "permissionType"
   FROM permissions
   ${this.connector.searchSQL(args)};
  `;

  private SELECT_PERMISSIONS_COUNT_SQL: string = `SELECT COUNT(*) AS total FROM permissions;`;

  constructor(private readonly connector: PostgresConnector) {}

  public async getPermissionByType(
    permissionType: PermissionType,
  ): Promise<PermissionDto | null> {
    return this.connector.getOne<PermissionDto>(
      this.SELECT_PERMISSIONS_SQL({
        where: `type = $1`,
      }),
      [permissionType],
    );
  }

  public async getManyPermissions(
    pagination?: Pagination,
  ): Promise<PermissionDto[]> {
    return this.connector.getMany<PermissionDto>(
      this.SELECT_PERMISSIONS_SQL({
        pagination,
      }),
    );
  }

  public async getAllPermissionsCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_PERMISSIONS_COUNT_SQL);
  }
}
