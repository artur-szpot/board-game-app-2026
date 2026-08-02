import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateGameScoreDto } from './dto/in/create-game-score.dto';
import { UpdateGameScoreDto } from './dto/in/update-game-score.dto';
import { GameScoreResponse } from './dto/out/game-score.response';

export interface GameScoreGateway {
  getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<GameScoreResponse>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<GameScoreResponse>>;
  create(
    input: CreateGameScoreDto,
    userId?: string,
  ): Promise<GameScoreResponse>;
  update(
    id: string,
    input: UpdateGameScoreDto,
    userId?: string,
  ): Promise<GameScoreResponse>;
  delete(id: string, userId?: string): Promise<GameScoreResponse>;
}

export const GAME_SCORE_GATEWAY = Symbol('GAME_SCORE_GATEWAY');
