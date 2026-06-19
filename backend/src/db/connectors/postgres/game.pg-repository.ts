import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { Pagination } from '@common/pagination/pagination';
import { CustomNotFoundError } from '@common/errors/service-errors';

import { CreateGameDto } from '../../../games/games/dto/in/create-game.dto';
import { UpdateGameDto } from '../../../games/games/dto/in/update-game.dto';
import { GameDto } from '../../../games/games/dto/in/game.dto';
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
      COALESCE((SELECT ARRAY_AGG(gl.location_id) FROM game_locations gl WHERE gl.game_id = games.id), ARRAY[]::text[]) AS "locationIds",
      COALESCE((SELECT ARRAY_AGG(gs.scoring_schema_id) FROM game_scoring_schemas gs WHERE gs.game_id = games.id), ARRAY[]::text[]) AS "scoringSchemaIds",
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
    RETURNING id, name, description, length, created_on AS "createdOn", updated_on AS "updatedOn";
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

  public async getManyGames(pagination?: Pagination): Promise<GameDto[]> {
    return this.connector.getMany<GameDto>(
      `${this.SELECT_GAMES_SQL} ${this.connector.searchSQL({ orderBy: 'name ASC', pagination })}`,
    );
  }

  public async getAllGamesCount(): Promise<number> {
    return this.connector.getCount(this.SELECT_GAMES_COUNT_SQL);
  }

  public async createGame(input: CreateGameDto): Promise<GameDto> {
    const id = createId();
    return this.connector.getOne<GameDto>(this.CREATE_GAME_SQL, [
      id,
      input.name,
      input.description ?? null,
      input.length,
    ]);
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

    if (columns.length === 0) {
      return existing;
    }

    values.push(gameId);
    const sql = `UPDATE games SET ${columns.join(', ')} WHERE id = $${values.length} RETURNING id, name, description, length, created_on AS "createdOn", updated_on AS "updatedOn";`;
    return this.connector.getOne<GameDto>(sql, values);
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
