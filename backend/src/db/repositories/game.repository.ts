import { Pagination } from '@common/pagination/pagination';

import { CreateGameDto } from '../../games/games/dto/in/create-game.dto';
import { UpdateGameDto } from '../../games/games/dto/in/update-game.dto';
import { GameDto } from '../../games/games/dto/in/game.dto';

export interface GameRepository {
  getGameById(gameId: string): Promise<GameDto | null>;
  getGameByName(name: string): Promise<GameDto | null>;
  getManyGames(pagination?: Pagination): Promise<GameDto[]>;
  getAllGamesCount(): Promise<number>;
  createGame(input: CreateGameDto): Promise<GameDto>;
  updateGame(gameId: string, input: UpdateGameDto): Promise<GameDto>;
  deleteGame(gameId: string): Promise<GameDto>;
}

export const GAME_REPOSITORY = Symbol('GAME_REPOSITORY');
