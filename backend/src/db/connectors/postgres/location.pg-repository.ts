import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { Pagination } from '@common/pagination/pagination';

import { CreateLocationDto } from '../../../games/locations/dto/in/create-location.dto';
import { UpdateLocationDto } from '../../../games/locations/dto/in/update-location.dto';
import { LocationDto } from '../../../games/locations/dto/in/location.dto';
import { LocationRepository } from '../../repositories/location.repository';
import { PostgresConnection } from './PostgresConnection';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresLocationRepository implements LocationRepository {
  private readonly SELECT_LOCATIONS_SQL = `
   SELECT
      id,
      name,
      description,
      parent_id AS "parentId",
      is_game_id AS "isGameId",
      created_on AS "createdOn",
      updated_on AS "updatedOn"
   FROM locations
  `;

  private readonly SELECT_LOCATIONS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM locations;';

  private readonly CREATE_LOCATION_SQL = `
     INSERT INTO locations (id, name, description, parent_id, is_game_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, parent_id AS "parentId", is_game_id AS "isGameId", created_on AS "createdOn", updated_on AS "updatedOn";
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
    if (input.isGameId !== undefined) {
      valuesToSet.push('is_game_id = $' + (valuesToSet.length + 2));
    }
    return `
      UPDATE locations
      SET
         ${valuesToSet.join(', ')},
         updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, description, parent_id AS "parentId", is_game_id AS "isGameId", created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_LOCATION_SQL = `
   DELETE FROM locations
   WHERE id = $1
   RETURNING id, name, description, parent_id AS "parentId", is_game_id AS "isGameId", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getLocationById(locationId: string): Promise<LocationDto | null> {
    return this.connector.getOne<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE id = $1`,
      [locationId],
    );
  }

  public async getLocationByName(name: string): Promise<LocationDto | null> {
    return this.connector.getOne<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE name = $1`,
      [name],
    );
  }

  public async getManyLocations(
    pagination?: Pagination,
  ): Promise<LocationDto[]> {
    return this.connector.getMany<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} ${this.connector.searchSQL({
        orderBy: 'name ASC',
        pagination,
      })}`,
    );
  }

  public async getAllLocationsCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_LOCATIONS_COUNT_SQL);
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
        input.isGameId ?? false,
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
    if (input.isGameId !== undefined) {
      parameters.push(input.isGameId);
    }

    return this.connector.getOne<LocationDto>(
      this.UPDATE_LOCATION_SQL(input),
      parameters,
    );
  }

  public async deleteLocation(locationId: string): Promise<LocationDto> {
    return this.connector.getOne<LocationDto>(
      this.DELETE_LOCATION_SQL,
      [locationId],
    );
  }
}
