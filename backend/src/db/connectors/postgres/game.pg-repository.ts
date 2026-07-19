import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { CustomNotFoundError } from '@common/errors/service-errors';

import { CreateGameDto } from '../../../games/games/dto/in/create-game.dto';
import { GameDto } from '../../../games/games/dto/in/game.dto';
import { UpdateGameDto } from '../../../games/games/dto/in/update-game.dto';
import { GameRepository } from '../../repositories/game.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresGameRepository implements GameRepository {
  private readonly SELECT_GAMES_SQL = `
    SELECT
      id,
      name,
      description,
      length,
      COALESCE((SELECT ARRAY_AGG(gt.tag_id) FROM game_tags gt WHERE gt.game_id = games.id), ARRAY[]::text[]) AS "tagIds",
      COALESCE((SELECT ARRAY_AGG(JSON_BUILD_OBJECT('locationId', gl.location_id, 'note', gl.note)) FROM game_locations gl WHERE gl.game_id = games.id), ARRAY[]::json[]) AS "locations",
      COALESCE((SELECT ARRAY_AGG(gl.location_id) FROM game_locations gl WHERE gl.game_id = games.id), ARRAY[]::text[]) AS "locationIds",
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
      id, name, description, length
    )
    VALUES ($1, $2, $3, $4)
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

  private readonly DELETE_GAME_SCORING_SCHEMAS_SQL = `
    DELETE FROM game_scoring_schemas
    WHERE game_id = $1;
  `;

  private readonly DELETE_GAME_HELPERS_SQL = `
    DELETE FROM game_helpers
    WHERE game_id = $1;
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getGameById(gameId: string): Promise<GameDto | null> {
    return this.connector.getOne<GameDto>(
      `${this.SELECT_GAMES_SQL} WHERE id = $1`,
      [gameId],
    );
  }

  public async getGameByName(name: string): Promise<GameDto | null> {
    return this.connector.getOne<GameDto>(
      `${this.SELECT_GAMES_SQL} WHERE name = $1`,
      [name],
    );
  }

  public async getManyGames(dto?: GetManyItemsDto): Promise<GameDto[]> {
    const { pagination } = dto ?? {};
    return this.connector.getMany<GameDto>(
      `${this.SELECT_GAMES_SQL} ${this.connector.searchSQL({ orderBy: 'name ASC', pagination })}`,
    );
  }

  public async getGamesCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_GAMES_COUNT_SQL);
  }

  public async createGame(input: CreateGameDto): Promise<GameDto> {
    const id = createId();
    const connection = await this.connector.getConnection();

    try {
      await connection.query('BEGIN');
      await connection.query(this.CREATE_GAME_SQL, [
        id,
        input.name,
        input.description ?? null,
        input.length,
      ]);

      if (input.tagIds?.length) {
        await connection.query(this.CREATE_GAME_TAG_SQL, [id, input.tagIds]);
      }

      if (input.locations?.length) {
        const locationsPayload = JSON.stringify(
          input.locations.map((location) => ({
            location_id: location.locationId,
            note: location.note ?? null,
          })),
        );

        await connection.query(this.CREATE_GAME_LOCATION_SQL, [
          id,
          locationsPayload,
        ]);
      }

      if (input.scoringSchemaIds?.length) {
        await connection.query(this.CREATE_GAME_SCORING_SCHEMA_SQL, [
          id,
          input.scoringSchemaIds,
        ]);
      }

      if (input.helperIds?.length) {
        await connection.query(this.CREATE_GAME_HELPER_SQL, [id, input.helperIds]);
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
  ): Promise<GameDto> {
    const existing = await this.getGameById(gameId);
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
          await connection.query(this.CREATE_GAME_TAG_SQL, [gameId, input.tagIds]);
        }
      }

      if (locations !== undefined) {
        await connection.query(this.DELETE_GAME_LOCATIONS_SQL, [gameId]);
        if (locations.length) {
          const locationsPayload = JSON.stringify(
            locations.map((location) => ({
              location_id: location.locationId,
              note: location.note ?? null,
            })),
          );

          await connection.query(this.CREATE_GAME_LOCATION_SQL, [
            gameId,
            locationsPayload,
          ]);
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

  public async deleteGame(gameId: string): Promise<GameDto> {
    const deleted = await this.connector.getOne<GameDto>(
      `DELETE FROM games WHERE id = $1 RETURNING id, name, description, length, created_on AS "createdOn", updated_on AS "updatedOn";`,
      [gameId],
    );

    if (!deleted) {
      throw new CustomNotFoundError(`game with ID "${gameId}"`);
    }

    return deleted;
  }
}
