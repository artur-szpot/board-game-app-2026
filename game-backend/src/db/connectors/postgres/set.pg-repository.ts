import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';
import { CreateSetDto } from '../../../games/sets/dto/in/create-set.dto';
import { SetDto } from '../../../games/sets/dto/in/set.dto';
import { UpdateSetDto } from '../../../games/sets/dto/in/update-set.dto';
import { SetRepository } from '../../repositories/set.repository';
import { PostgresConnector } from './PostgresConnector';

const SET_COLUMNS = `id, owner_id AS "ownerId", private, name, data, created_on AS "createdOn", updated_on AS "updatedOn"`;

@Injectable()
export class PostgresSetRepository implements SetRepository {
  private readonly SELECT_SETS_SQL = `SELECT ${SET_COLUMNS} FROM sets`;

  private readonly CREATE_SET_SQL = `
    INSERT INTO sets (id, owner_id, private, name, data)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${SET_COLUMNS};
  `;

  private readonly DELETE_SET_SQL = `
    DELETE FROM sets
    WHERE id = $1
    RETURNING ${SET_COLUMNS};
  `;

  constructor(private readonly connector: PostgresConnector) {}

  private ownershipPredicate(
    args: unknown[],
    itemOwnership?: ItemOwnershipDto,
  ): string | undefined {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    if (!userId || hasCollectionSuperuserPermission) {
      return undefined;
    }
    args.push(userId);
    const userIdParameter = args.length;
    args.push(SYSTEM_OWNER_ID);
    return `(owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
  }

  private buildOrderBy(sort?: GetManyItemsDto['sort']): string {
    const sortableFields: Record<string, string> = {
      name: 'name',
      createdOn: 'created_on',
      updatedOn: 'updated_on',
    };
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
    const args: unknown[] = [];
    const predicates: string[] = [];

    if (dto?.searchTerm) {
      args.push(`%${dto.searchTerm}%`);
      predicates.push(`name ILIKE $${args.length}`);
    }
    const ownership = this.ownershipPredicate(args, dto);
    if (ownership) {
      predicates.push(ownership);
    }

    return {
      pagination: dto?.pagination,
      args: args.length ? args : undefined,
      orderBy: this.buildOrderBy(dto?.sort),
      where: predicates.length ? predicates.join(' AND ') : undefined,
    };
  }

  public async getSetById(
    setId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto | null> {
    const args: unknown[] = [setId];
    const ownership = this.ownershipPredicate(args, itemOwnership);
    const where = ownership ? `id = $1 AND ${ownership}` : 'id = $1';
    return this.connector.getOne<SetDto>(
      `${this.SELECT_SETS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getSetsByIds(
    setIds: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto[]> {
    if (setIds.length === 0) {
      return [];
    }
    const args: unknown[] = [setIds];
    const ownership = this.ownershipPredicate(args, itemOwnership);
    const where = ownership ? `id = ANY($1) AND ${ownership}` : 'id = ANY($1)';
    return this.connector.getMany<SetDto>(
      `${this.SELECT_SETS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getSetByName(
    name: string,
    ownerId: string,
  ): Promise<SetDto | null> {
    return this.connector.getOne<SetDto>(
      `${this.SELECT_SETS_SQL} WHERE name = $1 AND owner_id = $2`,
      [name, ownerId],
    );
  }

  public async getManySets(dto?: GetManyItemsDto): Promise<SetDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<SetDto>(
      `${this.SELECT_SETS_SQL} ${this.connector.searchSQL({ where, orderBy, pagination })}`,
      args,
    );
  }

  public async getSetsCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    return this.connector.getCount(
      `SELECT COUNT(*) AS total FROM sets${where ? ` WHERE ${where}` : ''};`,
      args,
    );
  }

  public async countReferencingHelpers(setId: string): Promise<number> {
    return this.connector.getCount(
      'SELECT COUNT(*) AS total FROM helper_sets WHERE set_id = $1;',
      [setId],
    );
  }

  public async createSet(
    input: CreateSetDto,
    ownerId: string,
    isPrivate = true,
  ): Promise<SetDto> {
    return this.connector.getOne<SetDto>(this.CREATE_SET_SQL, [
      createId(),
      ownerId,
      isPrivate,
      input.name,
      JSON.stringify(input.data),
    ]);
  }

  public async updateSet(
    setId: string,
    input: UpdateSetDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto> {
    const existing = await this.getSetById(setId, itemOwnership);
    if (!existing) {
      throw new CustomNotFoundError(`set with ID "${setId}"`);
    }

    const parameters: unknown[] = [setId];
    const assignments: string[] = [];
    if (input.name !== undefined) {
      parameters.push(input.name);
      assignments.push(`name = $${parameters.length}`);
    }
    if (input.data !== undefined) {
      parameters.push(JSON.stringify(input.data));
      assignments.push(`data = $${parameters.length}`);
    }
    if (input.private !== undefined) {
      parameters.push(input.private);
      assignments.push(`private = $${parameters.length}`);
    }
    return this.connector.getOne<SetDto>(
      `
        UPDATE sets
        SET ${assignments.join(', ')}, updated_on = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING ${SET_COLUMNS};
      `,
      parameters,
    );
  }

  public async deleteSet(
    setId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto> {
    const existing = await this.getSetById(setId, itemOwnership);
    if (!existing) {
      throw new CustomNotFoundError(`set with ID "${setId}"`);
    }
    return this.connector.getOne<SetDto>(this.DELETE_SET_SQL, [setId]);
  }
}
