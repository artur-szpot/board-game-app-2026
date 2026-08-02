import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';

import { CreateGameDto } from '../../../games/games/dto/in/create-game.dto';
import { GameDto } from '../../../games/games/dto/in/game.dto';
import { UpdateGameDto } from '../../../games/games/dto/in/update-game.dto';
import { GameRepository } from '../../repositories/game.repository';
import { PostgresConnector } from './PostgresConnector';

type LocationData = { locationId: string; note?: string };

@Injectable()
export class PostgresGameRepository implements GameRepository {
  private readonly SELECT_GAMES_SQL = `
    SELECT
      id,
      owner_id AS "ownerId",
      private,
      name,
      description,
      length,
      min_players AS "minPlayers",
      max_players AS "maxPlayers",
      COALESCE((SELECT ARRAY_AGG(gt.tag_id) FROM game_tags gt WHERE gt.game_id = games.id), ARRAY[]::text[]) AS "tagIds",
      COALESCE((
        SELECT ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'locationId', linked_locations.location_id,
            'note', linked_locations.note,
            'isGameId', linked_locations.is_game_id
          )
        )
        FROM (
          SELECT
            gl.location_id,
            gl.note,
            FALSE AS is_game_id
          FROM game_locations gl
          WHERE gl.game_id = games.id
          UNION ALL
          SELECT
            ggl.location_id,
            ggl.note,
            TRUE AS is_game_id
          FROM game_game_locations ggl
          WHERE ggl.game_id = games.id
        ) linked_locations
      ), ARRAY[]::json[]) AS "locations",
      COALESCE((SELECT ARRAY_AGG(gs.schema_id) FROM game_scoring_schemas gs WHERE gs.game_id = games.id), ARRAY[]::text[]) AS "scoringSchemaIds",
      COALESCE((SELECT ARRAY_AGG(gh.helper_id) FROM game_helpers gh WHERE gh.game_id = games.id), ARRAY[]::text[]) AS "helperIds",
      created_on AS "createdOn",
      updated_on AS "updatedOn"
    FROM games
  `;

  private readonly SELECT_GAMES_COUNT_SQL =
    'SELECT COUNT(*) AS total FROM games;';

  private readonly CREATE_GAME_SQL = `
    INSERT INTO games (
      id, owner_id, private, name, description, length, min_players, max_players
    )
    VALUES ($1, $2, true, $3, $4, $5, $6, $7)
  `;

  private readonly CREATE_GAME_TAG_SQL = `
    INSERT INTO game_tags (game_id, tag_id)
    SELECT $1, UNNEST($2::text[]);
  `;

  private readonly CREATE_GAME_LOCATION_SQL = `
    INSERT INTO game_locations (game_id, location_id, note)
    SELECT $1, locations.location_id, locations.note
    FROM JSON_TO_RECORDSET($2::json) AS locations(location_id text, note text);
  `;

  private readonly CREATE_GAME_GAME_LOCATION_SQL = `
    INSERT INTO game_game_locations (game_id, location_id, note)
    SELECT $1, game_locations.location_id, game_locations.note
    FROM JSON_TO_RECORDSET($2::json) AS game_locations(location_id text, note text);
  `;

  private readonly CREATE_GAME_SCORING_SCHEMA_SQL = `
    INSERT INTO game_scoring_schemas (game_id, schema_id)
    SELECT $1, UNNEST($2::text[]);
  `;

  private readonly CREATE_GAME_HELPER_SQL = `
    INSERT INTO game_helpers (game_id, helper_id)
    SELECT $1, UNNEST($2::text[]);
  `;

  private readonly DELETE_GAME_TAGS_SQL = `
    DELETE FROM game_tags
    WHERE game_id = $1;
  `;

  private readonly DELETE_GAME_LOCATIONS_SQL = `
    DELETE FROM game_locations
    WHERE game_id = $1;
  `;

  private readonly DELETE_GAME_GAME_LOCATIONS_SQL = `
    DELETE FROM game_game_locations
    WHERE game_id = $1;
  `;

  private readonly DELETE_GAME_SCORING_SCHEMAS_SQL = `
    DELETE FROM game_scoring_schemas
    WHERE game_id = $1;
  `;

  private readonly DELETE_GAME_HELPERS_SQL = `
    DELETE FROM game_helpers
    WHERE game_id = $1;
  `;

  constructor(private readonly connector: PostgresConnector) {}

  private splitLocationsByType(
    locations: NonNullable<
      CreateGameDto['locations'] | UpdateGameDto['locations']
    >,
  ): {
    locationLocations: LocationData[];
    gameLocations: LocationData[];
  } {
    return locations.reduce(
      (acc, location) => {
        if (location.isGameId) {
          acc.gameLocations.push(location);
          return acc;
        }

        acc.locationLocations.push(location);
        return acc;
      },
      {
        locationLocations: [] as LocationData[],
        gameLocations: [] as LocationData[],
      },
    );
  }

  private buildOrderBy(sort?: GetManyItemsDto['sort']): string {
    const sortableFields: Record<string, string> = {
      name: 'name',
      createdOn: 'created_on',
      updatedOn: 'updated_on',
      length: 'length',
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

  public async getGameById(
    gameId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<GameDto | null> {
    const args: string[] = [gameId];
    let where = 'id = $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      where += ` AND owner_id = $${args.length}`;
    }

    return this.connector.getOne<GameDto>(
      `${this.SELECT_GAMES_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getGameByName(
    name: string,
    ownerId: string,
  ): Promise<GameDto | null> {
    return this.connector.getOne<GameDto>(
      `${this.SELECT_GAMES_SQL} WHERE name = $1 AND owner_id = $2`,
      [name, ownerId],
    );
  }

  public async getManyGames(dto?: GetManyItemsDto): Promise<GameDto[]> {
    const { pagination, args, orderBy, where } = this.buildSearchArgs(dto);
    return this.connector.getMany<GameDto>(
      `${this.SELECT_GAMES_SQL} ${this.connector.searchSQL({ where, orderBy, pagination })}`,
      args,
    );
  }

  public async getGamesCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);
    const query = where
      ? `SELECT COUNT(*) AS total FROM games WHERE ${where};`
      : this.SELECT_GAMES_COUNT_SQL;
    return this.connector.getCount(query, args);
  }

  public async createGame(
    input: CreateGameDto,
    ownerId: string,
  ): Promise<GameDto> {
    const id = createId();
    const connection = await this.connector.getConnection();

    try {
      await connection.query('BEGIN');
      await connection.query(this.CREATE_GAME_SQL, [
        id,
        ownerId,
        input.name,
        input.description ?? null,
        input.length,
        input.minPlayers ?? null,
        input.maxPlayers ?? null,
      ]);

      if (input.tagIds?.length) {
        await connection.query(this.CREATE_GAME_TAG_SQL, [id, input.tagIds]);
      }

      if (input.locations?.length) {
        const { locationLocations, gameLocations } = this.splitLocationsByType(
          input.locations,
        );

        if (locationLocations.length) {
          const locationsPayload = JSON.stringify(
            locationLocations.map((location) => ({
              location_id: location.locationId,
              note: location.note ?? null,
            })),
          );

          await connection.query(this.CREATE_GAME_LOCATION_SQL, [
            id,
            locationsPayload,
          ]);
        }

        if (gameLocations.length) {
          const gameLocationsPayload = JSON.stringify(
            gameLocations.map((location) => ({
              location_id: location.locationId,
              note: location.note ?? null,
            })),
          );

          await connection.query(this.CREATE_GAME_GAME_LOCATION_SQL, [
            id,
            gameLocationsPayload,
          ]);
        }
      }

      if (input.scoringSchemaIds?.length) {
        await connection.query(this.CREATE_GAME_SCORING_SCHEMA_SQL, [
          id,
          input.scoringSchemaIds,
        ]);
      }

      if (input.helperIds?.length) {
        await connection.query(this.CREATE_GAME_HELPER_SQL, [
          id,
          input.helperIds,
        ]);
      }

      const created = await connection.query<GameDto>(
        `${this.SELECT_GAMES_SQL} WHERE id = $1`,
        [id],
      );

      await connection.query('COMMIT');
      if (!created.rows[0]) {
        throw new Error(`Failed to load created game with ID "${id}"`);
      }
      return created.rows[0];
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }

  public async updateGame(
    gameId: string,
    input: UpdateGameDto,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<GameDto> {
    const existing = await this.getGameById(
      gameId,
      userId,
      hasCollectionSuperuserPermission,
    );
    if (!existing) {
      throw new CustomNotFoundError(`game with ID "${gameId}"`);
    }

    const columns: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      columns.push(`name = $${values.length + 1}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      columns.push(`description = $${values.length + 1}`);
      values.push(input.description ?? null);
    }
    if (input.length !== undefined) {
      columns.push(`length = $${values.length + 1}`);
      values.push(input.length);
    }
    if (input.minPlayers !== undefined) {
      columns.push(`min_players = $${values.length + 1}`);
      values.push(input.minPlayers);
    }
    if (input.maxPlayers !== undefined) {
      columns.push(`max_players = $${values.length + 1}`);
      values.push(input.maxPlayers);
    }

    const locations = input.locations;

    const hasRelationsToUpdate =
      input.tagIds !== undefined ||
      locations !== undefined ||
      input.scoringSchemaIds !== undefined ||
      input.helperIds !== undefined;

    if (columns.length === 0 && !hasRelationsToUpdate) {
      return existing;
    }

    const connection = await this.connector.getConnection();

    try {
      await connection.query('BEGIN');

      if (columns.length > 0) {
        columns.push('updated_on = CURRENT_TIMESTAMP');
        values.push(gameId);
        const sql = `UPDATE games SET ${columns.join(', ')} WHERE id = $${values.length};`;
        await connection.query(sql, values);
      }

      if (input.tagIds !== undefined) {
        await connection.query(this.DELETE_GAME_TAGS_SQL, [gameId]);
        if (input.tagIds.length) {
          await connection.query(this.CREATE_GAME_TAG_SQL, [
            gameId,
            input.tagIds,
          ]);
        }
      }

      if (locations !== undefined) {
        await connection.query(this.DELETE_GAME_LOCATIONS_SQL, [gameId]);
        await connection.query(this.DELETE_GAME_GAME_LOCATIONS_SQL, [gameId]);

        if (locations.length) {
          const { locationLocations, gameLocations } =
            this.splitLocationsByType(locations);

          if (locationLocations.length) {
            const locationsPayload = JSON.stringify(
              locationLocations.map((location) => ({
                location_id: location.locationId,
                note: location.note ?? null,
              })),
            );

            await connection.query(this.CREATE_GAME_LOCATION_SQL, [
              gameId,
              locationsPayload,
            ]);
          }

          if (gameLocations.length) {
            const gameLocationsPayload = JSON.stringify(
              gameLocations.map((location) => ({
                location_id: location.locationId,
                note: location.note ?? null,
              })),
            );

            await connection.query(this.CREATE_GAME_GAME_LOCATION_SQL, [
              gameId,
              gameLocationsPayload,
            ]);
          }
        }
      }

      if (input.scoringSchemaIds !== undefined) {
        await connection.query(this.DELETE_GAME_SCORING_SCHEMAS_SQL, [gameId]);
        if (input.scoringSchemaIds.length) {
          await connection.query(this.CREATE_GAME_SCORING_SCHEMA_SQL, [
            gameId,
            input.scoringSchemaIds,
          ]);
        }
      }

      if (input.helperIds !== undefined) {
        await connection.query(this.DELETE_GAME_HELPERS_SQL, [gameId]);
        if (input.helperIds.length) {
          await connection.query(this.CREATE_GAME_HELPER_SQL, [
            gameId,
            input.helperIds,
          ]);
        }
      }

      const updated = await connection.query<GameDto>(
        `${this.SELECT_GAMES_SQL} WHERE id = $1`,
        [gameId],
      );

      await connection.query('COMMIT');
      if (!updated.rows[0]) {
        throw new Error(`Failed to load updated game with ID "${gameId}"`);
      }
      return updated.rows[0];
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally {
      connection.release();
    }
  }

  public async deleteGame(
    gameId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<GameDto> {
    const existing = await this.getGameById(
      gameId,
      userId,
      hasCollectionSuperuserPermission,
    );

    if (!existing) {
      throw new CustomNotFoundError(`game with ID "${gameId}"`);
    }

    const deleted = await this.connector.getOne<GameDto>(
      `DELETE FROM games WHERE id = $1 RETURNING id, owner_id AS "ownerId", private, name, description, length, min_players AS "minPlayers", max_players AS "maxPlayers", created_on AS "createdOn", updated_on AS "updatedOn";`,
      [gameId],
    );

    if (!deleted) {
      throw new CustomNotFoundError(`game with ID "${gameId}"`);
    }

    return deleted;
  }
}
