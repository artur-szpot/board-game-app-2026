import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';

import {
    CustomBadRequestError,
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import {
    GAME_SCORE_REPOSITORY,
    GameScoreRepository,
} from '@db/repositories/game-score.repository';
import {
    SCORING_SCHEMA_REPOSITORY,
    ScoringSchemaRepository,
} from '@db/repositories/scoring-schema.repository';

import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { ScoringSchemaDefinitionDto } from '../../scoring-schemas/dto/schema/scoring-schema-definition.dto';
import { CreateGameScoreDto } from '../dto/in/create-game-score.dto';
import { GameScoreDto } from '../dto/in/game-score.dto';
import { UpdateGameScoreDto } from '../dto/in/update-game-score.dto';
import { GameScoreResponse } from '../dto/out/game-score.response';
import { GameScoreGateway } from '../game-score.gateway';

const collectRowIds = (schema: ScoringSchemaDefinitionDto): Set<string> =>
  new Set(
    schema.groups.flatMap((group) =>
      group.categories.flatMap((category) =>
        category.rows.map((row) => row.id),
      ),
    ),
  );

@Injectable()
export class GameScoreService implements GameScoreGateway {
  private readonly logger = new Logger(GameScoreService.name);

  constructor(
    @Inject(GAME_SCORE_REPOSITORY)
    private readonly gameScoreRepository: GameScoreRepository,
    @Inject(SCORING_SCHEMA_REPOSITORY)
    private readonly scoringSchemaRepository: ScoringSchemaRepository,
  ) {}

  private mapToResponse(score: GameScoreDto): GameScoreResponse {
    return {
      id: score.id,
      ownerId: score.ownerId,
      private: score.private,
      gameId: score.gameId,
      playedOn: new Date(score.playedOn).toISOString(),
      schemaId: score.schemaId,
      schema: score.schema,
      schemaName: score.schemaName,
      scores: score.scores,
      createdOn: new Date(score.createdOn).toISOString(),
      updatedOn: new Date(score.updatedOn).toISOString(),
    };
  }

  private async assertScoresMatchSchema(
    schemaId: string,
    scores: CreateGameScoreDto['scores'],
    userId: string,
  ): Promise<void> {
    const schema = await this.scoringSchemaRepository.getScoringSchemaById(
      schemaId,
      { userId, hasCollectionSuperuserPermission: false },
    );
    if (!schema) {
      throw new CustomNotFoundError(`scoring schema with ID "${schemaId}"`);
    }

    const knownRowIds = collectRowIds(schema.schema);
    const unknownRowIds = Object.keys(scores.values).filter(
      (rowId) => !knownRowIds.has(rowId),
    );
    if (unknownRowIds.length) {
      throw new CustomBadRequestError(
        `Unknown scoring row ID(s): ${unknownRowIds.join(', ')}`,
      );
    }
  }

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameScoreResponse> {
    try {
      const score = await this.gameScoreRepository.getGameScoreById(
        id,
        itemOwnership,
      );
      if (!score) {
        this.logger.error(`Could not find game score with ID "${id}"`);
        throw new CustomNotFoundError(`game score with ID "${id}"`);
      }
      return this.mapToResponse(score);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving game score with ID "${id}": ${error}`,
      );
      throw new CustomInternalError('retrieving the game score');
    }
  }

  public async getMany(
    dto?: GetManyItemsDto,
  ): Promise<Paginated<GameScoreResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.gameScoreRepository.getManyGameScores(dto),
        this.gameScoreRepository.getGameScoresCount(dto),
      ]);
      return { page: items.map((item) => this.mapToResponse(item)), total };
    } catch (error) {
      this.logger.error(
        `Unexpected error while retrieving game scores: ${error}`,
      );
      throw new CustomInternalError('retrieving game scores');
    }
  }

  public async create(
    input: CreateGameScoreDto,
    userId?: string,
  ): Promise<GameScoreResponse> {
    if (!userId) {
      throw new CustomInternalError('creating the game score');
    }

    try {
      await this.assertScoresMatchSchema(input.schemaId, input.scores, userId);
      const created = await this.gameScoreRepository.createGameScore(
        input,
        userId,
      );
      return this.mapToResponse(created);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating game score: ${error}`);
      throw new CustomInternalError('creating the game score');
    }
  }

  public async update(
    id: string,
    input: UpdateGameScoreDto,
    userId?: string,
  ): Promise<GameScoreResponse> {
    if (!userId) {
      throw new CustomInternalError('updating the game score');
    }

    validateUpdateDtoNotEmpty(input);
    try {
      const itemOwnership: ItemOwnershipDto = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const updated = await this.gameScoreRepository.updateGameScore(
        id,
        input,
        itemOwnership,
      );
      return this.mapToResponse(updated);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating game score: ${error}`);
      throw new CustomInternalError('updating the game score');
    }
  }

  public async delete(id: string, userId?: string): Promise<GameScoreResponse> {
    if (!userId) {
      throw new CustomInternalError('deleting the game score');
    }

    try {
      const itemOwnership: ItemOwnershipDto = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const deleted = await this.gameScoreRepository.deleteGameScore(
        id,
        itemOwnership,
      );
      return this.mapToResponse(deleted);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting game score: ${error}`);
      throw new CustomInternalError('deleting the game score');
    }
  }
}
