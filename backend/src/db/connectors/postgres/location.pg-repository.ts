import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateLocationDto } from '../../../games/locations/dto/in/create-location.dto';
import { LocationDto } from '../../../games/locations/dto/in/location.dto';
import { UpdateLocationDto } from '../../../games/locations/dto/in/update-location.dto';
import { LocationRepository } from '../../repositories/location.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresLocationRepository implements LocationRepository {
  private readonly SELECT_LOCATIONS_SQL = `
   SELECT
      id,
      name,
      description,
      parent_id AS "parentId",
      created_on AS "createdOn",
      updated_on AS "updatedOn"
   FROM locations
  `;

  private readonly SELECT_LOCATIONS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM locations;';

  private readonly CREATE_LOCATION_SQL = `
     INSERT INTO locations (id, name, description, parent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly UPDATE_LOCATION_SQL = (input: UpdateLocationDto): string => {
    const valuesToSet: string[] = [];
    if (input.name !== undefined) {
      valuesToSet.push('name = $2');
    }
    if (input.description !== undefined) {
      valuesToSet.push('description = $' + (valuesToSet.length + 2));
    }
    if (input.parentId !== undefined) {
      valuesToSet.push('parent_id = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE locations
      SET
         ${valuesToSet.join(', ')},
         updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_LOCATION_SQL = `
   DELETE FROM locations
   WHERE id = $1
   RETURNING id, name, description, parent_id AS "parentId", created_on AS "createdOn", updated_on AS "updatedOn";
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
    const where = searchTerm
      ? `(name ILIKE $1 OR COALESCE(description, '') ILIKE $1)`
      : undefined;
    const orderBy = this.buildOrderBy(sort);

    return { pagination, args, orderBy, where };
  }

  public async getLocationById(
    locationId: string,
  ): Promise<LocationDto | null> {
    return this.connector.getOne<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE id = $1`,
      [locationId],
    );
  }

  public async getLocationsByIds(
    locationIds: string[],
  ): Promise<LocationDto[]> {
    if (locationIds.length === 0) {
      return [];
    }

    return this.connector.getMany<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE id IN $1`,
      [locationIds],
    );
  }

  public async getLocationByName(name: string): Promise<LocationDto | null> {
    return this.connector.getOne<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE name = $1`,
      [name],
    );
  }

  public async getManyLocations(dto?: GetManyItemsDto): Promise<LocationDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} ${this.connector.searchSQL({
        where,
        orderBy,
        pagination,
      })}`,
      args,
    );
  }

  public async getLocationsCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    const query = where
      ? `SELECT COUNT(*) AS total FROM locations WHERE ${where};`
      : this.SELECT_LOCATIONS_COUNT_SQL;
    return this.connector.getCount(query, args);
  }

  public async createLocation(input: CreateLocationDto): Promise<LocationDto> {
    const id = createId();
    const result = await this.connector.getOne<LocationDto>(
      this.CREATE_LOCATION_SQL,
      [
        id,
        input.name,
        input.description ?? null,
        input.parentId ?? null,
      ],
    );
    return result;
  }

  public async updateLocation(
    locationId: string,
    input: UpdateLocationDto,
  ): Promise<LocationDto> {
    const parameters: any[] = [locationId];
    if (input.name !== undefined) {
      parameters.push(input.name);
    }
    if (input.description !== undefined) {
      parameters.push(input.description);
    }
    if (input.parentId !== undefined) {
      parameters.push(input.parentId);
    }

    return this.connector.getOne<LocationDto>(
      this.UPDATE_LOCATION_SQL(input),
      parameters,
    );
  }

  public async deleteLocation(locationId: string): Promise<LocationDto> {
    return this.connector.getOne<LocationDto>(this.DELETE_LOCATION_SQL, [
      locationId,
    ]);
  }
}
