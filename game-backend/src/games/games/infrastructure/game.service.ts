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
    const locationIds = input.locations
      ?.filter((location) => !location.isGameId)
      .map((location) => location.locationId);
    const gameLocationIds = input.locations
      ?.filter((location) => location.isGameId)
      .map((location) => location.locationId);

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
        locationIds,
        (ids) => this.locationGateway.getByIds(ids),
        'Location',
      ),
      this.ensureIdsExist(gameLocationIds, (ids) => this.getByIds(ids), 'Game'),
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

  private async mapGameResponse(game: GameDto): Promise<GameDto> {
    const { tagIds: _, ...responseGame } = game as GameDto & {
      tagIds?: string[];
    };

    const tagIds = (game as GameDto & { tagIds?: string[] }).tagIds ?? [];
    const locationIds = (game.locations ?? [])
      .filter((location) => !location.isGameId)
      .map((location) => location.locationId);
    const locationResponses = locationIds.length
      ? await this.locationGateway.getByIds(locationIds)
      : [];
    const locations = (game.locations ?? []).map((location) => {
      const locationResponse = locationResponses.find(
        (response) => response.id === location.locationId,
      );
      return {
        ...location,
        isGameId: location.isGameId ?? false,
        path: locationResponse?.path ?? [],
      };
    });

    if (tagIds.length === 0) {
      return { ...responseGame, locations, tags: [] };
    }

    const tags = await this.tagGateway.getByIds(tagIds);
    return {
      ...responseGame,
      locations,
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
      })),
    };
  }

  public async getById(id: string): Promise<GameDto> {
    try {
      const game = await this.gameRepository.getGameById(id);
      if (!game) {
        this.logger.error(`Could not find game with ID "${id}"`);
        throw new CustomNotFoundError(`game with ID "${id}"`);
      }
      return this.mapGameResponse(game);
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

  public async getByIds(ids: string[]): Promise<GameDto[]> {
    const games = await Promise.all(ids.map((id) => this.getById(id)));
    return games;
  }

  public async getMany(dto?: GetManyItemsDto): Promise<Paginated<GameDto>> {
    try {
      const [items, total] = await Promise.all([
        this.gameRepository.getManyGames(dto),
        this.gameRepository.getGamesCount(dto),
      ]);
      const page = await Promise.all(
        items.map((item) => this.mapGameResponse(item)),
      );
      return { page, total };
    } catch (error) {
      this.logger.error(`Unexpected error while retrieving games: ${error}`);
      throw new CustomInternalError('retrieving games');
    }
  }

  public async create(input: CreateGameDto): Promise<GameDto> {
    try {
      await this.validateInput(input);
      const created = await this.gameRepository.createGame(input);
      return this.mapGameResponse(created);
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
      const updated = await this.gameRepository.updateGame(id, input);
      return this.mapGameResponse(updated);
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
      const deleted = await this.gameRepository.deleteGame(id);
      return this.mapGameResponse(deleted);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting game: ${error}`);
      throw new CustomInternalError('deleting the game');
    }
  }
}
