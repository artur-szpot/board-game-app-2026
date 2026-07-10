import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateGameDto } from '../dto/in/create-game.dto';
import { GameDto } from '../dto/in/game.dto';
import { UpdateGameDto } from '../dto/in/update-game.dto';

export interface GameGateway {
  getById(id: string): Promise<GameDto>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<GameDto>>;
  create(input: CreateGameDto): Promise<GameDto>;
  update(id: string, input: UpdateGameDto): Promise<GameDto>;
  delete(id: string): Promise<GameDto>;
}

export const GAME_GATEWAY = Symbol('GAME_GATEWAY');
