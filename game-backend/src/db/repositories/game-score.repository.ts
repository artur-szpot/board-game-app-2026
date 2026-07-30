import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateGameScoreDto } from '../../games/game-scores/dto/in/create-game-score.dto';
import { GameScoreDto } from '../../games/game-scores/dto/in/game-score.dto';
import { UpdateGameScoreDto } from '../../games/game-scores/dto/in/update-game-score.dto';

export interface GameScoreRepository {
  getGameScoreById(gameScoreId: string): Promise<GameScoreDto | null>;
  getManyGameScores(dto?: GetManyItemsDto): Promise<GameScoreDto[]>;
  getGameScoresCount(dto?: GetManyItemsDto): Promise<number>;
  createGameScore(input: CreateGameScoreDto): Promise<GameScoreDto>;
  updateGameScore(
    gameScoreId: string,
    input: UpdateGameScoreDto,
  ): Promise<GameScoreDto>;
  deleteGameScore(gameScoreId: string): Promise<GameScoreDto>;
}

export const GAME_SCORE_REPOSITORY = Symbol('GAME_SCORE_REPOSITORY');
