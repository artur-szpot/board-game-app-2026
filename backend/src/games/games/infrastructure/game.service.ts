import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import {
  CustomInternalError,
  CustomNotFoundError,
} from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import {
  GAME_REPOSITORY,
  GameRepository,
} from '@db/repositories/game.repository';

import {
  HELPER_GATEWAY,
  HelperGateway,
} from '../../helpers/infrastructure/helper.gateway';
import {
  LOCATION_GATEWAY,
  LocationGateway,
} from '../../locations/infrastructure/location.gateway';
import {
  SCORING_SCHEMA_GATEWAY,
  ScoringSchemaGateway,
} from '../../scoring-schemas/infrastructure/scoring-schema.gateway';
import { TAG_GATEWAY, TagGateway } from '../../tags/infrastructure/tag.gateway';
import { CreateGameDto } from '../dto/in/create-game.dto';
import { GameDto } from '../dto/in/game.dto';
import { UpdateGameDto } from '../dto/in/update-game.dto';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService implements GameGateway {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @Inject(GAME_REPOSITORY)
    private readonly gameRepository: GameRepository,
    @Inject(TAG_GATEWAY)
    private readonly tagGateway: TagGateway,
    @Inject(LOCATION_GATEWAY)
    private readonly locationGateway: LocationGateway,
    @Inject(SCORING_SCHEMA_GATEWAY)
    private readonly scoringSchemaGateway: ScoringSchemaGateway,
    @Inject(HELPER_GATEWAY)
    private readonly helperGateway: HelperGateway,
  ) {}

  private async ensureIdsExist(
    ids: string[] | undefined,
    getter: (ids: string[]) => Promise<unknown[]>,
    entityName: string,
  ) {
    if (!ids?.length) {
      return;
    }

    const entities = await getter(ids);
    if (entities.length !== ids.length) {
      const missingId = ids.find(
        (id) =>
          !entities.some((entity) => (entity as { id?: string }).id === id),
      );
      throw new BadRequestException(
        `${entityName} with ID "${missingId ?? 'unknown'}" not found`,
      );
    }
  }

  private async validateInput(
    input: CreateGameDto | UpdateGameDto,
    id?: string,
  ) {
    const existingGame = await this.gameRepository.getGameByName(input.name);
    if (existingGame && existingGame.id !== id) {
      throw new BadRequestException(
        `Game name "${input.name}" is already in use`,
      );
    }

    await Promise.all([
      this.ensureIdsExist(
        input.tagIds,
        (ids) => this.tagGateway.getByIds(ids),
        'Tag',
      ),
      this.ensureIdsExist(
        input.locationIds,
        (ids) => this.locationGateway.getByIds(ids),
        'Location',
      ),
      this.ensureIdsExist(
        input.scoringSchemaIds,
        (ids) => this.scoringSchemaGateway.getByIds(ids),
        'Scoring schema',
      ),
      this.ensureIdsExist(
        input.helperIds,
        (ids) => this.helperGateway.getByIds(ids),
        'Helper',
      ),
    ]);
  }

  public async getById(id: string): Promise<GameDto> {
    try {
      const game = await this.gameRepository.getGameById(id);
      if (!game) {
        this.logger.error(`Could not find game with ID "${id}"`);
        throw new CustomNotFoundError(`game with ID "${id}"`);
      }
      return game;
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving game with ID "${id}": ${error}`,
      );
      throw new CustomInternalError('retrieving the game');
    }
  }

  public async getMany(dto?: GetManyItemsDto): Promise<Paginated<GameDto>> {
    try {
      const [items, total] = await Promise.all([
        this.gameRepository.getManyGames(dto),
        this.gameRepository.getGamesCount(dto),
      ]);
      return { page: items, total };
    } catch (error) {
      this.logger.error(`Unexpected error while retrieving games: ${error}`);
      throw new CustomInternalError('retrieving games');
    }
  }

  public async create(input: CreateGameDto): Promise<GameDto> {
    try {
      await this.validateInput(input);
      return await this.gameRepository.createGame(input);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating game: ${error}`);
      throw new CustomInternalError('creating the game');
    }
  }

  public async update(id: string, input: UpdateGameDto): Promise<GameDto> {
    validateUpdateDtoNotEmpty(input);
    try {
      await this.getById(id);
      await this.validateInput(input, id);
      return await this.gameRepository.updateGame(id, input);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating game: ${error}`);
      throw new CustomInternalError('updating the game');
    }
  }

  public async delete(id: string): Promise<GameDto> {
    try {
      await this.getById(id);
      return await this.gameRepository.deleteGame(id);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting game: ${error}`);
      throw new CustomInternalError('deleting the game');
    }
  }
}
