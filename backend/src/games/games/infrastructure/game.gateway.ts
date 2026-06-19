import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateGameDto } from '../dto/in/create-game.dto';
import { UpdateGameDto } from '../dto/in/update-game.dto';
import { GameDto } from '../dto/in/game.dto';

export interface GameGateway {
  getById(id: string): Promise<GameDto>;
  getMany(pagination?: Pagination): Promise<Paginated<GameDto>>;
  create(input: CreateGameDto): Promise<GameDto>;
  update(id: string, input: UpdateGameDto): Promise<GameDto>;
  delete(id: string): Promise<GameDto>;
}

export const GAME_GATEWAY = Symbol('GAME_GATEWAY');
