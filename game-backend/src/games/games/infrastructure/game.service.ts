import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  GetManyItemsDto,
  ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
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

  private async ensureGameIdsExist(
    gameIds: string[] | undefined,
    userId: string,
  ) {
    if (!gameIds?.length) {
      return;
    }

    const uniqueIds = [...new Set(gameIds)];
    const games = await Promise.all(
      uniqueIds.map((gameId) =>
        this.gameRepository.getGameById(gameId, {
          userId,
          hasCollectionSuperuserPermission: false,
        }),
      ),
    );
    const missingIndex = games.findIndex((game) => !game);
    if (missingIndex !== -1) {
      throw new BadRequestException(
        `Game with ID "${uniqueIds[missingIndex]}" not found`,
      );
    }
  }

  private async canReachGame(
    fromGameId: string,
    targetGameId: string,
    userId: string,
    visited: Set<string>,
  ): Promise<boolean> {
    if (fromGameId === targetGameId) {
      return true;
    }
    if (visited.has(fromGameId)) {
      return false;
    }

    visited.add(fromGameId);
    const game = await this.gameRepository.getGameById(fromGameId, {
      userId,
      hasCollectionSuperuserPermission: false,
    });
    if (!game) {
      return false;
    }

    const linkedGameIds = (game.locations ?? [])
      .filter((location) => location.isGameId)
      .map((location) => location.locationId);

    for (const linkedGameId of linkedGameIds) {
      if (
        await this.canReachGame(linkedGameId, targetGameId, userId, visited)
      ) {
        return true;
      }
    }

    return false;
  }

  private async ensureNoGameLocationCycle(
    gameId: string,
    gameLocationIds: string[] | undefined,
    userId: string,
  ) {
    if (!gameLocationIds?.length) {
      return;
    }

    if (gameLocationIds.includes(gameId)) {
      throw new BadRequestException(
        'Game cannot reference itself as a location',
      );
    }

    for (const locationGameId of [...new Set(gameLocationIds)]) {
      const wouldCreateCycle = await this.canReachGame(
        locationGameId,
        gameId,
        userId,
        new Set<string>(),
      );
      if (wouldCreateCycle) {
        throw new BadRequestException(
          `Game location relationship would create a cycle via game ID "${locationGameId}"`,
        );
      }
    }
  }

  private async validateInput(
    input: CreateGameDto | UpdateGameDto,
    userId: string,
    id?: string,
    currentGame?: GameDto,
  ) {
    const minPlayers = input.minPlayers ?? currentGame?.minPlayers;
    const maxPlayers = input.maxPlayers ?? currentGame?.maxPlayers;

    if (
      minPlayers !== undefined &&
      (!Number.isInteger(minPlayers) || minPlayers < 1)
    ) {
      throw new BadRequestException('minPlayers must be a positive integer');
    }

    if (
      maxPlayers !== undefined &&
      (!Number.isInteger(maxPlayers) || maxPlayers < 1)
    ) {
      throw new BadRequestException('maxPlayers must be a positive integer');
    }

    if (
      minPlayers !== undefined &&
      maxPlayers !== undefined &&
      maxPlayers < minPlayers
    ) {
      throw new BadRequestException(
        'maxPlayers must be greater than or equal to minPlayers',
      );
    }

    const locationIds = input.locations
      ?.filter((location) => !location.isGameId)
      .map((location) => location.locationId);
    const gameLocationIds = input.locations
      ?.filter((location) => location.isGameId)
      .map((location) => location.locationId);

    if (input.name !== undefined) {
      const existingGame = await this.gameRepository.getGameByName(
        input.name,
        userId,
      );
      if (existingGame && existingGame.id !== id) {
        throw new BadRequestException(
          `Game name "${input.name}" is already in use`,
        );
      }
    }

    await Promise.all([
      this.ensureIdsExist(
        input.tagIds,
        (ids) =>
          this.tagGateway.getByIds(ids, {
            userId,
            hasCollectionSuperuserPermission: false,
          }),
        'Tag',
      ),
      this.ensureIdsExist(
        locationIds,
        (ids) =>
          this.locationGateway.getByIds(ids, {
            userId,
            hasCollectionSuperuserPermission: false,
          }),
        'Location',
      ),
      this.ensureGameIdsExist(gameLocationIds, userId),
      this.ensureIdsExist(
        input.scoringSchemaIds,
        (ids) =>
          this.scoringSchemaGateway.getByIds(ids, {
            userId,
            hasCollectionSuperuserPermission: false,
          }),
        'Scoring schema',
      ),
      this.ensureIdsExist(
        input.helperIds,
        (ids) =>
          this.helperGateway.getByIds(ids, {
            userId,
            hasCollectionSuperuserPermission: false,
          }),
        'Helper',
      ),
    ]);

    if (id) {
      await this.ensureNoGameLocationCycle(id, gameLocationIds, userId);
    }
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
      ? await this.locationGateway.getByIds(locationIds, {
          userId: game.ownerId,
          hasCollectionSuperuserPermission: false,
        })
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

    const tags = await this.tagGateway.getByIds(tagIds, {
      userId: game.ownerId,
      hasCollectionSuperuserPermission: false,
    });
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

  private async getByIdWithAccess(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto> {
    try {
      const game = await this.gameRepository.getGameById(id, itemOwnership);
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

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto> {
    return this.getByIdWithAccess(id, itemOwnership);
  }

  public async getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto[]> {
    const games = await Promise.all(
      ids.map((id) => this.getById(id, itemOwnership)),
    );
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

  public async create(input: CreateGameDto, userId?: string): Promise<GameDto> {
    if (!userId) {
      throw new CustomInternalError('creating the game');
    }

    try {
      await this.validateInput(input, userId);
      const created = await this.gameRepository.createGame(input, userId);
      return this.mapGameResponse(created);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating game: ${error}`);
      throw new CustomInternalError('creating the game');
    }
  }

  public async update(
    id: string,
    input: UpdateGameDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('updating the game');
    }

    validateUpdateDtoNotEmpty(input);
    try {
      const writeOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const currentGame = await this.getById(id, writeOwnership);
      await this.validateInput(input, userId, id, currentGame);
      const updated = await this.gameRepository.updateGame(
        id,
        input,
        writeOwnership,
      );
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

  public async delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('deleting the game');
    }

    try {
      const writeOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      await this.getById(id, writeOwnership);
      const deleted = await this.gameRepository.deleteGame(id, writeOwnership);
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
