import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';

import { CreateGameDto } from '../../games/games/dto/in/create-game.dto';
import { GameDto } from '../../games/games/dto/in/game.dto';
import { UpdateGameDto } from '../../games/games/dto/in/update-game.dto';

export interface GameRepository {
  getGameById(
    gameId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto | null>;
  getGameByName(name: string, ownerId: string): Promise<GameDto | null>;
  getManyGames(dto?: GetManyItemsDto): Promise<GameDto[]>;
  getGamesCount(dto?: GetManyItemsDto): Promise<number>;
  createGame(input: CreateGameDto, ownerId: string): Promise<GameDto>;
  updateGame(
    gameId: string,
    input: UpdateGameDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto>;
  deleteGame(
    gameId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameDto>;
}

export const GAME_REPOSITORY = Symbol('GAME_REPOSITORY');
