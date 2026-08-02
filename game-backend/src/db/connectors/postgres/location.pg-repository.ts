import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';

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
      owner_id AS "ownerId",
      private,
      name,
      description,
      parent_id AS "parentId",
      path,
      path_ids AS "pathIds",
      created_on AS "createdOn",
      updated_on AS "updatedOn"
   FROM locations
  `;

  private readonly SELECT_LOCATIONS_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM locations;';

  private readonly CREATE_LOCATION_SQL = `
      INSERT INTO locations (id, owner_id, private, name, description, parent_id, path, path_ids)
      VALUES ($1, $2, true, $3, $4, $5, $6, $7)
      RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", path, path_ids AS "pathIds", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  private readonly UPDATE_LOCATION_SQL = (input: UpdateLocationDto): string => {
    const valuesToSet: string[] = [];
    let nextPlaceholderIndex = 2;

    if (input.name !== undefined) {
      valuesToSet.push(`name = $${nextPlaceholderIndex}`);
      nextPlaceholderIndex += 1;
    }
    if (input.description !== undefined) {
      valuesToSet.push(`description = $${nextPlaceholderIndex}`);
      nextPlaceholderIndex += 1;
    }
    if (input.parentId !== undefined) {
      valuesToSet.push(`parent_id = $${nextPlaceholderIndex}`);
      nextPlaceholderIndex += 1;
    }
    if (input.private !== undefined) {
      valuesToSet.push(`private = $${nextPlaceholderIndex}`);
      nextPlaceholderIndex += 1;
    }

    valuesToSet.push(`path = $${nextPlaceholderIndex}`);
    valuesToSet.push(`path_ids = $${nextPlaceholderIndex + 1}`);

    return `
      UPDATE locations
      SET
         ${valuesToSet.join(', ')},
         updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", path, path_ids AS "pathIds", created_on AS "createdOn", updated_on AS "updatedOn";
    `;
  };

  private readonly DELETE_LOCATION_SQL = `
   DELETE FROM locations
   WHERE id = $1
    RETURNING id, owner_id AS "ownerId", private, name, description, parent_id AS "parentId", path, path_ids AS "pathIds", created_on AS "createdOn", updated_on AS "updatedOn";
  `;

  constructor(private readonly connector: PostgresConnector) {}

  private async calculatePathData(
    locationId: string,
    name: string,
    parentId: string | null | undefined,
    ownerId?: string,
  ): Promise<{ path: string[]; pathIds: string[] }> {
    if (!parentId) {
      return { path: [name], pathIds: [] };
    }

    const args: string[] = [parentId];
    let where = 'id = $1';
    if (ownerId) {
      args.push(ownerId);
      where += ` AND owner_id = $${args.length}`;
    }

    const parent = await this.connector.getOne<{
      id: string;
      name: string;
      path: string[];
      pathIds: string[];
    }>(`${this.SELECT_LOCATIONS_SQL} WHERE ${where}`, args);

    if (!parent) {
      return { path: [name], pathIds: [] };
    }

    return {
      path: [name, ...(parent.path ?? [parent.name])],
      pathIds: [...(parent.pathIds ?? []), parent.id],
    };
  }

  private async recalculateDescendantPaths(
    locationId: string,
    ownerId?: string,
  ): Promise<void> {
    const args: string[] = [locationId];
    let query =
      'SELECT id, name, parent_id AS "parentId" FROM locations WHERE path_ids @> ARRAY[$1]::VARCHAR(40)[]';
    if (ownerId) {
      args.push(ownerId);
      query += ` AND owner_id = $${args.length}`;
    }
    query += ' ORDER BY array_length(path_ids, 1) ASC, id ASC';

    const descendants = await this.connector.getMany<{
      id: string;
      name: string;
      parentId: string | null;
    }>(query, args);

    for (const descendant of descendants) {
      const { path, pathIds } = await this.calculatePathData(
        descendant.id,
        descendant.name,
        descendant.parentId,
        ownerId,
      );
      await this.connector.getOne(
        `UPDATE locations SET path = $2, path_ids = $3, updated_on = CURRENT_TIMESTAMP WHERE id = $1`,
        [descendant.id, path, pathIds],
      );
    }
  }

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
      predicates.push(`owner_id = $${args.length}`);
    }

    const where = predicates.length ? predicates.join(' AND ') : undefined;
    const orderBy = this.buildOrderBy(sort);

    return { pagination, args: args.length ? args : undefined, orderBy, where };
  }

  public async getLocationById(
    locationId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto | null> {
    const args: string[] = [locationId];
    let where = 'id = $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      where += ` AND owner_id = $${args.length}`;
    }

    return this.connector.getOne<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getLocationsByIds(
    locationIds: string[],
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto[]> {
    if (locationIds.length === 0) {
      return [];
    }

    const args: (string[] | string)[] = [locationIds];
    let where = 'id IN $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      where += ` AND owner_id = $${args.length}`;
    }

    return this.connector.getMany<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getLocationByName(
    name: string,
    ownerId: string,
  ): Promise<LocationDto | null> {
    return this.connector.getOne<LocationDto>(
      `${this.SELECT_LOCATIONS_SQL} WHERE name = $1 AND owner_id = $2`,
      [name, ownerId],
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

  public async createLocation(
    input: CreateLocationDto,
    ownerId: string,
  ): Promise<LocationDto> {
    const id = createId();
    const { path, pathIds } = await this.calculatePathData(
      id,
      input.name,
      input.parentId ?? null,
      ownerId,
    );
    const result = await this.connector.getOne<LocationDto>(
      this.CREATE_LOCATION_SQL,
      [
        id,
        ownerId,
        input.name,
        input.description ?? null,
        input.parentId ?? null,
        path,
        pathIds,
      ],
    );
    return result;
  }

  public async updateLocation(
    locationId: string,
    input: UpdateLocationDto,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto> {
    const currentLocation = await this.getLocationById(
      locationId,
      userId,
      hasCollectionSuperuserPermission,
    );
    if (!currentLocation) {
      throw new CustomNotFoundError(`location with ID "${locationId}"`);
    }

    const nextName = input.name ?? currentLocation?.name ?? '';
    const nextParentId = input.parentId ?? currentLocation?.parentId ?? null;
    const { path, pathIds } = await this.calculatePathData(
      locationId,
      nextName,
      nextParentId,
      currentLocation.ownerId,
    );

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
    if (input.private !== undefined) {
      parameters.push(input.private);
    }
    parameters.push(path, pathIds);

    const result = await this.connector.getOne<LocationDto>(
      this.UPDATE_LOCATION_SQL(input),
      parameters,
    );

    await this.recalculateDescendantPaths(locationId, currentLocation.ownerId);
    return result;
  }

  public async deleteLocation(
    locationId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto> {
    const existing = await this.getLocationById(
      locationId,
      userId,
      hasCollectionSuperuserPermission,
    );

    if (!existing) {
      throw new CustomNotFoundError(`location with ID "${locationId}"`);
    }

    const deletedLocation = await this.connector.getOne<LocationDto>(
      this.DELETE_LOCATION_SQL,
      [locationId],
    );

    if (deletedLocation) {
      await this.recalculateDescendantPaths(locationId, existing.ownerId);
    }

    return deletedLocation;
  }
}
