import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';

import {
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
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { CreateGameScoreDto } from '../dto/in/create-game-score.dto';
import { UpdateGameScoreDto } from '../dto/in/update-game-score.dto';
import { GameScoreResponse } from '../dto/out/game-score.response';
import { GameScoreGateway } from '../game-score.gateway';

@Injectable()
export class GameScoreService implements GameScoreGateway {
  private readonly logger = new Logger(GameScoreService.name);

  constructor(
    @Inject(GAME_SCORE_REPOSITORY)
    private readonly gameScoreRepository: GameScoreRepository,
  ) {}

  private mapToResponse(score: any): GameScoreResponse {
    return {
      id: score.id,
      ownerId: score.ownerId,
      private: score.private,
      gameId: score.gameId,
      playedOn: new Date(score.playedOn).toISOString(),
      schema: score.schema,
      scores: score.scores,
      createdOn: new Date(score.createdOn).toISOString(),
      updatedOn: new Date(score.updatedOn).toISOString(),
    };
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
      const created = await this.gameScoreRepository.createGameScore(
        input,
        userId,
      );
      return this.mapToResponse(created);
    } catch (error) {
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
