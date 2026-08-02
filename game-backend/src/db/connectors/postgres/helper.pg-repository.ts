import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';
import { CreateHelperDto } from '../../../games/helpers/dto/in/create-helper.dto';
import { HelperDto } from '../../../games/helpers/dto/in/helper.dto';
import { UpdateHelperDto } from '../../../games/helpers/dto/in/update-helper.dto';
import { HelperRepository } from '../../repositories/helper.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresHelperRepository implements HelperRepository {
  private readonly SELECT_HELPERS_SQL = `
    SELECT
      id,
      owner_id AS "ownerId",
      private,
      name,
      logic,
      created_on AS "createdOn",
      updated_on AS "updatedOn"
    FROM helpers
  `;

  private readonly SELECT_HELPERS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM helpers;';

  private readonly CREATE_HELPER_SQL = `
    INSERT INTO helpers (id, owner_id, private, name, logic)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, owner_id AS "ownerId", private, name, logic, created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly UPDATE_HELPER_SQL = (input: UpdateHelperDto): string => {
    const valuesToSet: string[] = [];
    if (input.name !== undefined) {
      valuesToSet.push('name = $2');
    }
    if (input.logic !== undefined) {
      valuesToSet.push('logic = $' + (valuesToSet.length + 2));
    }
    if (input.private !== undefined) {
      valuesToSet.push('private = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE helpers
      SET
        ${valuesToSet.join(', ')},
        updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, owner_id AS "ownerId", private, name, logic, created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_HELPER_SQL = `
    DELETE FROM helpers
    WHERE id = $1
    RETURNING id, owner_id AS "ownerId", private, name, logic, created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  constructor(private readonly connector: PostgresConnector) {}

  private buildOrderBy(sort?: GetManyItemsDto['sort']): string {
    const sortableFields: Record<string, string> = {
      name: 'name',
      createdOn: 'created_on',
      updatedOn: 'updated_on',
    };

    // TODO: validate incoming sort keys and directions centrally instead of silently ignoring unsupported values.
    const clauses = Object.entries(sort ?? {})
      .filter(
        ([field, direction]) =>
          sortableFields[field] &&
          (direction === 'asc' || direction === 'desc'),
      )
      .map(
        ([field, direction]) =>
          `${sortableFields[field]} ${direction.toUpperCase()}`,
      );

    return clauses.length > 0 ? clauses.join(', ') : 'name ASC';
  }

  private buildSearchArgs(dto?: GetManyItemsDto) {
    const {
      pagination,
      searchTerm,
      sort,
      userId,
      hasCollectionSuperuserPermission,
    } = dto ?? {};
    const args: string[] = [];
    const predicates: string[] = [];

    if (searchTerm) {
      args.push(`%${searchTerm}%`);
      predicates.push(`name ILIKE $${args.length}`);
    }

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      predicates.push(
        `(owner_id = $${userIdParameter} OR owner_id = $${args.length})`,
      );
    }

    const where = predicates.length ? predicates.join(' AND ') : undefined;
    const orderBy = this.buildOrderBy(sort);

    return { pagination, args: args.length ? args : undefined, orderBy, where };
  }

  public async getHelperById(
    helperId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperDto | null> {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    const args: string[] = [helperId];
    let where = 'id = $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      where += ` AND (owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
    }

    return this.connector.getOne<HelperDto>(
      `${this.SELECT_HELPERS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getHelpersByIds(
    helperIds: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperDto[]> {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    if (helperIds.length === 0) {
      return [];
    }

    const args: (string[] | string)[] = [helperIds];
    let where = 'id IN $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      where += ` AND (owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
    }

    return this.connector.getMany<HelperDto>(
      `${this.SELECT_HELPERS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getHelperByName(
    name: string,
    ownerId: string,
  ): Promise<HelperDto | null> {
    return this.connector.getOne<HelperDto>(
      `${this.SELECT_HELPERS_SQL} WHERE name = $1 AND owner_id = $2`,
      [name, ownerId],
    );
  }

  public async getManyHelpers(dto?: GetManyItemsDto): Promise<HelperDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<HelperDto>(
      `${this.SELECT_HELPERS_SQL} ${this.connector.searchSQL({ where, orderBy, pagination })}`,
      args,
    );
  }

  public async getHelpersCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    const query = where
      ? `SELECT COUNT(*) AS total FROM helpers WHERE ${where};`
      : this.SELECT_HELPERS_COUNT_SQL;
    return this.connector.getCount(query, args);
  }

  public async createHelper(
    input: CreateHelperDto,
    ownerId: string,
    isPrivate = true,
  ): Promise<HelperDto> {
    const id = createId();
    const result = await this.connector.getOne<HelperDto>(
      this.CREATE_HELPER_SQL,
      [id, ownerId, isPrivate, input.name, input.logic],
    );
    return result;
  }

  public async updateHelper(
    helperId: string,
    input: UpdateHelperDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperDto> {
    const existing = await this.getHelperById(helperId, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`helper with ID "${helperId}"`);
    }

    const parameters: any[] = [helperId];
    if (input.name !== undefined) {
      parameters.push(input.name);
    }
    if (input.logic !== undefined) {
      parameters.push(input.logic);
    }
    if (input.private !== undefined) {
      parameters.push(input.private);
    }
    return this.connector.getOne<HelperDto>(
      this.UPDATE_HELPER_SQL(input),
      parameters,
    );
  }

  public async deleteHelper(
    helperId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperDto> {
    const existing = await this.getHelperById(helperId, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`helper with ID "${helperId}"`);
    }

    return this.connector.getOne<HelperDto>(this.DELETE_HELPER_SQL, [helperId]);
  }
}
