import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import {
  CustomInternalError,
  CustomNotFoundError,
} from '@common/errors/service-errors';
import { Pagination } from '@common/pagination/pagination';

import { CreateGameScoreDto } from '../../../games/game-scores/dto/in/create-game-score.dto';
import { GameScoreDto } from '../../../games/game-scores/dto/in/game-score.dto';
import { UpdateGameScoreDto } from '../../../games/game-scores/dto/in/update-game-score.dto';
import { GameScoreRepository } from '../../repositories/game-score.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresGameScoreRepository implements GameScoreRepository {
  private readonly SELECT_SQL = `
    SELECT id, game_id AS "gameId", played_on AS "playedOn", schema_id AS "schemaId", schema, scores, created_on AS "createdOn", updated_on AS "updatedOn"
    FROM game_scores
  `;

  constructor(private readonly connector: PostgresConnector) {}

  public async getGameScoreById(
    gameScoreId: string,
  ): Promise<GameScoreDto | null> {
    return this.connector.getOne<GameScoreDto>(
      `${this.SELECT_SQL} WHERE id = $1`,
      [gameScoreId],
    );
  }

  public async getManyGameScores(
    pagination?: Pagination,
  ): Promise<GameScoreDto[]> {
    return this.connector.getMany<GameScoreDto>(
      `${this.SELECT_SQL} ${this.connector.searchSQL({ orderBy: 'played_on DESC', pagination })}`,
    );
  }

  public async getAllGameScoresCount(): Promise<number> {
    return this.connector.getCount(
      'SELECT COUNT(*) AS total FROM game_scores;',
    );
  }

  public async createGameScore(
    input: CreateGameScoreDto,
  ): Promise<GameScoreDto> {
    const id = createId();
    const sql = `
      INSERT INTO game_scores (id, game_id, played_on, schema_id, scores)
      VALUES ($1, $2, COALESCE($3::timestamptz, NOW()), $4, $5::jsonb)
      RETURNING id, game_id AS "gameId", played_on AS "playedOn", schema_id AS "schemaId", schema, scores, created_on AS "createdOn", updated_on AS "updatedOn";
    `;
    return this.connector.getOne<GameScoreDto>(sql, [
      id,
      input.gameId,
      input.playedOn ?? null,
      input.schemaId,
      JSON.stringify(input.scores),
    ]);
  }

  public async updateGameScore(
    gameScoreId: string,
    input: UpdateGameScoreDto,
  ): Promise<GameScoreDto> {
    const existing = await this.getGameScoreById(gameScoreId);
    if (!existing) {
      throw new CustomNotFoundError(`game score with ID "${gameScoreId}"`);
    }

    const columns: string[] = [];
    const values: unknown[] = [];
    if (input.gameId !== undefined) {
      columns.push(`game_id = $${values.length + 1}`);
      values.push(input.gameId);
    }
    if (input.playedOn !== undefined) {
      columns.push(`played_on = $${values.length + 1}`);
      values.push(input.playedOn);
    }
    if (input.schemaId !== undefined) {
      columns.push(`schema_id = $${values.length + 1}`);
      values.push(input.schemaId);
    }
    if (input.scores !== undefined) {
      columns.push(`scores = $${values.length + 1}::jsonb`);
      values.push(JSON.stringify(input.scores));
    }
    if (!columns.length) {
      return existing;
    }

    values.push(gameScoreId);

    return this.connector.getOne<GameScoreDto>(
      `UPDATE game_scores SET ${columns.join(', ')} WHERE id = $${values.length} RETURNING id, game_id AS "gameId", played_on AS "playedOn", schema_id AS "schemaId", schema, scores, created_on AS "createdOn", updated_on AS "updatedOn";`,
      values,
    );
  }

  public async deleteGameScore(gameScoreId: string): Promise<GameScoreDto> {
    const existing = await this.getGameScoreById(gameScoreId);
    if (!existing) {
      throw new CustomNotFoundError(`game score with ID "${gameScoreId}"`);
    }
    const deleted = await this.connector.getOne<GameScoreDto>(
      `DELETE FROM game_scores WHERE id = $1 RETURNING id, game_id AS "gameId", played_on AS "playedOn", schema_id AS "schemaId", schema, scores, created_on AS "createdOn", updated_on AS "updatedOn";`,
      [gameScoreId],
    );
    if (!deleted) {
      throw new CustomInternalError(`game score with ID "${gameScoreId}"`);
    }
    return deleted;
  }
}
