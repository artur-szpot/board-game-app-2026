import { Injectable } from '@nestjs/common';

import { PermissionDto } from '@auth/modules/permissions/dto/in/permission.dto';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';
import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
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

  private buildOrderBy(sort?: GetManyItemsDto['sort']): string {
    const sortableFields: Record<string, string> = {
      permissionType: 'type',
      description: 'description',
    };

    // TODO: validate incoming sort keys and directions centrally instead of silently ignoring unsupported values.
    const clauses = Object.entries(sort ?? {})
      .filter(
        ([field, direction]) =>
          sortableFields[field] && (direction === 'asc' || direction === 'desc'),
      )
      .map(
        ([field, direction]) =>
          `${sortableFields[field]} ${direction.toUpperCase()}`,
      );

    return clauses.length > 0 ? clauses.join(', ') : 'type ASC';
  }

  private buildSearchArgs(dto?: GetManyItemsDto) {
    const { pagination, searchTerm, sort } = dto ?? {};
    const args = searchTerm ? [`%${searchTerm}%`] : undefined;
    const where = searchTerm
      ? `(type ILIKE $1 OR description ILIKE $1)`
      : undefined;
    const orderBy = this.buildOrderBy(sort);

    return { pagination, args, orderBy, where };
  }

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
    dto?: GetManyItemsDto,
  ): Promise<PermissionDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<PermissionDto>(
      this.SELECT_PERMISSIONS_SQL({
        where,
        orderBy,
        pagination,
      }),
      args,
    );
  }

  public async getPermissionsCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    const query = where
      ? `SELECT COUNT(*) AS total FROM permissions WHERE ${where};`
      : this.SELECT_PERMISSIONS_COUNT_SQL;
    return this.connector.getCount(query, args);
  }
}
