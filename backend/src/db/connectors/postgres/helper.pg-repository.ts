import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
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
      name,
      logic,
      created_on AS "createdOn",
      updated_on AS "updatedOn"
    FROM helpers
  `;

  private readonly SELECT_HELPERS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM helpers;';

  private readonly CREATE_HELPER_SQL = `
    INSERT INTO helpers (id, name, logic)
    VALUES ($1, $2, $3)
    RETURNING id, name, logic, created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly UPDATE_HELPER_SQL = (input: UpdateHelperDto): string => {
    const valuesToSet: string[] = [];
    if (input.name !== undefined) {
      valuesToSet.push('name = $2');
    }
    if (input.logic !== undefined) {
      valuesToSet.push('logic = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE helpers
      SET
        ${valuesToSet.join(', ')},
        updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, logic, created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_HELPER_SQL = `
    DELETE FROM helpers
    WHERE id = $1
    RETURNING id, name, logic, created_on AS "createdOn", updated_on AS "updatedOn";
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
          sortableFields[field] && (direction === 'asc' || direction === 'desc'),
      )
      .map(
        ([field, direction]) =>
          `${sortableFields[field]} ${direction.toUpperCase()}`,
      );

    return clauses.length > 0 ? clauses.join(', ') : 'name ASC';
  }

  private buildSearchArgs(dto?: GetManyItemsDto) {
    const { pagination, searchTerm, sort } = dto ?? {};
    const args = searchTerm ? [`%${searchTerm}%`] : undefined;
    const where = searchTerm ? `name ILIKE $1` : undefined;
    const orderBy = this.buildOrderBy(sort);

    return { pagination, args, orderBy, where };
  }

  public async getHelperById(helperId: string): Promise<HelperDto | null> {
    return this.connector.getOne<HelperDto>(
      `${this.SELECT_HELPERS_SQL} WHERE id = $1`,
      [helperId],
    );
  }

  public async getHelpersByIds(helperIds: string[]): Promise<HelperDto[]> {
    if (helperIds.length === 0) {
      return [];
    }

    return this.connector.getMany<HelperDto>(
      `${this.SELECT_HELPERS_SQL} WHERE id IN $1`,
      [helperIds],
    );
  }

  public async getHelperByName(name: string): Promise<HelperDto | null> {
    return this.connector.getOne<HelperDto>(
      `${this.SELECT_HELPERS_SQL} WHERE name = $1`,
      [name],
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

  public async createHelper(input: CreateHelperDto): Promise<HelperDto> {
    const id = createId();
    const result = await this.connector.getOne<HelperDto>(
      this.CREATE_HELPER_SQL,
      [id, input.name, input.logic],
    );
    return result;
  }

  public async updateHelper(
    helperId: string,
    input: UpdateHelperDto,
  ): Promise<HelperDto> {
    const parameters: any[] = [helperId];
    if (input.name !== undefined) {
      parameters.push(input.name);
    }
    if (input.logic !== undefined) {
      parameters.push(input.logic);
    }
    return this.connector.getOne<HelperDto>(
      this.UPDATE_HELPER_SQL(input),
      parameters,
    );
  }

  public async deleteHelper(helperId: string): Promise<HelperDto> {
    return this.connector.getOne<HelperDto>(this.DELETE_HELPER_SQL, [helperId]);
  }
}
