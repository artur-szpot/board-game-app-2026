import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateGameScoreDto } from './dto/in/create-game-score.dto';
import { UpdateGameScoreDto } from './dto/in/update-game-score.dto';
import { GameScoreResponse } from './dto/out/game-score.response';

export interface GameScoreGateway {
  getById(id: string): Promise<GameScoreResponse>;
  getMany(pagination?: Pagination): Promise<Paginated<GameScoreResponse>>;
  create(input: CreateGameScoreDto): Promise<GameScoreResponse>;
  update(id: string, input: UpdateGameScoreDto): Promise<GameScoreResponse>;
  delete(id: string): Promise<GameScoreResponse>;
}

export const GAME_SCORE_GATEWAY = Symbol('GAME_SCORE_GATEWAY');
