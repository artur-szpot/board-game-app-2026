import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import {
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';

import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { CreateGameScoreDto } from '../../../games/game-scores/dto/in/create-game-score.dto';
import { GameScoreDto } from '../../../games/game-scores/dto/in/game-score.dto';
import { UpdateGameScoreDto } from '../../../games/game-scores/dto/in/update-game-score.dto';
import { GameScoreRepository } from '../../repositories/game-score.repository';
import { PostgresConnector } from './PostgresConnector';

@Injectable()
export class PostgresGameScoreRepository implements GameScoreRepository {
  // game_scores has no schema column of its own; the definition is resolved through schema_id.
  private readonly SELECT_SQL = `
    SELECT gs.id, gs.owner_id AS "ownerId", gs.private, gs.game_id AS "gameId", gs.played_on AS "playedOn", gs.schema_id AS "schemaId", ss.schema, ss.name AS "schemaName", gs.scores, gs.created_on AS "createdOn", gs.updated_on AS "updatedOn"
    FROM game_scores gs
    LEFT JOIN scoring_schemas ss ON ss.id = gs.schema_id
  `;

  private readonly RETURNING_SQL = `
    RETURNING id, owner_id AS "ownerId", private, game_id AS "gameId", played_on AS "playedOn", schema_id AS "schemaId", scores, created_on AS "createdOn", updated_on AS "updatedOn"
  `;

  constructor(private readonly connector: PostgresConnector) {}

  private buildSearchArgs(dto?: GetManyItemsDto) {
    const { userId, hasCollectionSuperuserPermission, filters } = dto ?? {};
    const args: string[] = [];
    const predicates: string[] = [];

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      predicates.push(`gs.owner_id = $${args.length}`);
    }

    if (filters?.gameId) {
      args.push(filters.gameId);
      predicates.push(`gs.game_id = $${args.length}`);
    }

    return {
      args: args.length ? args : undefined,
      where: predicates.length ? predicates.join(' AND ') : undefined,
    };
  }

  public async getGameScoreById(
    gameScoreId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameScoreDto | null> {
    const { hasCollectionSuperuserPermission, userId } = itemOwnership ?? {};
    const args: string[] = [gameScoreId];
    let where = 'gs.id = $1';

    if (userId && !hasCollectionSuperuserPermission) {
      args.push(userId);
      where += ` AND gs.owner_id = $${args.length}`;
    }

    return this.connector.getOne<GameScoreDto>(
      `${this.SELECT_SQL} WHERE ${where}`,
      args,
    );
  }

  public async getManyGameScores(
    dto?: GetManyItemsDto,
  ): Promise<GameScoreDto[]> {
    const { args, where } = this.buildSearchArgs(dto);

    return this.connector.getMany<GameScoreDto>(
      `${this.SELECT_SQL} ${this.connector.searchSQL({ where, orderBy: 'gs.played_on DESC', pagination: dto?.pagination })}`,
      args,
    );
  }

  public async getGameScoresCount(dto?: GetManyItemsDto): Promise<number> {
    const { args, where } = this.buildSearchArgs(dto);

    return this.connector.getCount(
      `SELECT COUNT(*) AS total FROM game_scores gs${where ? ` WHERE ${where}` : ''};`,
      args,
    );
  }

  public async createGameScore(
    input: CreateGameScoreDto,
    ownerId: string,
  ): Promise<GameScoreDto> {
    const id = createId();
    const sql = `
      INSERT INTO game_scores (id, owner_id, private, game_id, played_on, schema_id, scores)
      VALUES ($1, $2, true, $3, COALESCE($4::timestamptz, NOW()), $5, $6::jsonb)
      ${this.RETURNING_SQL};
    `;
    return this.connector.getOne<GameScoreDto>(sql, [
      id,
      ownerId,
      input.gameId,
      input.playedOn ?? null,
      input.schemaId,
      JSON.stringify(input.scores),
    ]);
  }

  public async updateGameScore(
    gameScoreId: string,
    input: UpdateGameScoreDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameScoreDto> {
    const existing = await this.getGameScoreById(gameScoreId, itemOwnership);
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
    if (input.private !== undefined) {
      columns.push(`private = $${values.length + 1}`);
      values.push(input.private);
    }
    if (!columns.length) {
      return existing;
    }

    values.push(gameScoreId);

    return this.connector.getOne<GameScoreDto>(
      `UPDATE game_scores SET ${columns.join(', ')} WHERE id = $${values.length} ${this.RETURNING_SQL};`,
      values,
    );
  }

  public async deleteGameScore(
    gameScoreId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameScoreDto> {
    const existing = await this.getGameScoreById(gameScoreId, itemOwnership);
    if (!existing) {
      throw new CustomNotFoundError(`game score with ID "${gameScoreId}"`);
    }
    const deleted = await this.connector.getOne<GameScoreDto>(
      `DELETE FROM game_scores WHERE id = $1 ${this.RETURNING_SQL};`,
      [gameScoreId],
    );
    if (!deleted) {
      throw new CustomInternalError(`game score with ID "${gameScoreId}"`);
    }
    return deleted;
  }
}
