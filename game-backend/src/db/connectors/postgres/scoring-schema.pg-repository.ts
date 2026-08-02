import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';

import { ScoringSchemaDto } from '../../../games/scoring-schemas/dto/in/scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../../../games/scoring-schemas/dto/in/update-scoring-schema.dto';
import { ScoringSchemaRepository } from '../../repositories/scoring-schema.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresScoringSchemaRepository implements ScoringSchemaRepository {
  private readonly SELECT_SCORING_SCHEMA_SQL = `
    SELECT
      id,
      owner_id AS "ownerId",
      private,
      name,
      schema,
      description,
      created_on AS "createdOn",
      updated_on AS "updatedOn"
    FROM scoring_schemas
  `;

  private readonly SELECT_SCORING_SCHEMAS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM scoring_schemas;';

  private readonly CREATE_SCORING_SCHEMA_SQL = `
    INSERT INTO scoring_schemas (id, owner_id, private, name, schema, description)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, owner_id AS "ownerId", private, name, schema, description, created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly UPDATE_SCORING_SCHEMA_SQL = (
    input: UpdateScoringSchemaDto,
  ): string => {
    const valuesToSet: string[] = [];
    if (input.name !== undefined) {
      valuesToSet.push('name = $2');
    }
    if (input.schema !== undefined) {
      valuesToSet.push('schema = $' + (valuesToSet.length + 2));
    }
    if (input.description !== undefined) {
      valuesToSet.push('description = $' + (valuesToSet.length + 2));
    }
    if (input.private !== undefined) {
      valuesToSet.push('private = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE scoring_schemas
      SET
        ${valuesToSet.join(', ')},
        updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, owner_id AS "ownerId", private, name, schema, description, created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_SCORING_SCHEMA_SQL = `
    DELETE FROM scoring_schemas
    WHERE id = $1
    RETURNING id, owner_id AS "ownerId", private, name, schema, description, created_on AS "createdOn", updated_on AS "updatedOn";
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
      predicates.push(
        `(name ILIKE $${args.length} OR COALESCE(description, '') ILIKE $${args.length})`,
      );
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

  public async getScoringSchemaById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto | null> {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    const args: string[] = [id];
    let where = 'id = $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      where += ` AND (owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
    }

    return this.connector.getOne<ScoringSchemaDto>(
      `${this.SELECT_SCORING_SCHEMA_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getScoringSchemaByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto[]> {
    const { userId, hasCollectionSuperuserPermission } = itemOwnership ?? {};
    if (ids.length === 0) {
      return [];
    }

    const args: (string[] | string)[] = [ids];
    let where = 'id IN $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      const userIdParameter = args.length;
      args.push(SYSTEM_OWNER_ID);
      where += ` AND (owner_id = $${userIdParameter} OR owner_id = $${args.length})`;
    }

    return this.connector.getMany<ScoringSchemaDto>(
      `${this.SELECT_SCORING_SCHEMA_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getScoringSchemaByName(
    name: string,
    ownerId: string,
  ): Promise<ScoringSchemaDto | null> {
    return this.connector.getOne<ScoringSchemaDto>(
      `${this.SELECT_SCORING_SCHEMA_SQL} WHERE name = $1 AND owner_id = $2`,
      [name, ownerId],
    );
  }

  public async getManyScoringSchemas(
    dto?: GetManyItemsDto,
  ): Promise<ScoringSchemaDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<ScoringSchemaDto>(
      `${this.SELECT_SCORING_SCHEMA_SQL} ${this.connector.searchSQL({ where, orderBy, pagination })}`,
      args,
    );
  }

  public async getScoringSchemasCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    const query = where
      ? `SELECT COUNT(*) AS total FROM scoring_schemas WHERE ${where};`
      : this.SELECT_SCORING_SCHEMAS_COUNT_SQL;
    return this.connector.getCount(query, args);
  }

  public async createScoringSchema(
    input: any,
    ownerId: string,
    isPrivate = true,
  ): Promise<ScoringSchemaDto> {
    const id = createId();
    const result = await this.connector.getOne<ScoringSchemaDto>(
      this.CREATE_SCORING_SCHEMA_SQL,
      [
        id,
        ownerId,
        isPrivate,
        input.name,
        input.schema,
        input.description ?? null,
      ],
    );
    return result;
  }

  public async updateScoringSchema(
    id: string,
    input: UpdateScoringSchemaDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto> {
    const existing = await this.getScoringSchemaById(id, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`scoring schema with ID "${id}"`);
    }

    const parameters: any[] = [id];
    if (input.name !== undefined) {
      parameters.push(input.name);
    }
    if (input.schema !== undefined) {
      parameters.push(input.schema);
    }
    if (input.description !== undefined) {
      parameters.push(input.description);
    }
    if (input.private !== undefined) {
      parameters.push(input.private);
    }
    return this.connector.getOne<ScoringSchemaDto>(
      this.UPDATE_SCORING_SCHEMA_SQL(input),
      parameters,
    );
  }

  public async deleteScoringSchema(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto> {
    const existing = await this.getScoringSchemaById(id, itemOwnership);

    if (!existing) {
      throw new CustomNotFoundError(`scoring schema with ID "${id}"`);
    }

    return this.connector.getOne<ScoringSchemaDto>(
      this.DELETE_SCORING_SCHEMA_SQL,
      [id],
    );
  }
}
