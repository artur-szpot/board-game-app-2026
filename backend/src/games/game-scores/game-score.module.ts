import { Module } from '@nestjs/common';

import { PostgresGameScoreRepository } from '@db/connectors/postgres/game-score.pg-repository';
import { DbModule } from '@db/db.module';
import { GAME_SCORE_REPOSITORY } from '@db/repositories/game-score.repository';

import { GameScoreController } from './game-score.controller';
import { GAME_SCORE_GATEWAY } from './game-score.gateway';
import { GameScoreService } from './infrastructure/game-score.service';

const gameScoreGatewayProvider = {
  provide: GAME_SCORE_GATEWAY,
  useClass: GameScoreService,
};
const gameScoreRepositoryProvider = {
  provide: GAME_SCORE_REPOSITORY,
  useClass: PostgresGameScoreRepository,
};

@Module({
  imports: [DbModule],
  controllers: [GameScoreController],
  providers: [gameScoreGatewayProvider, gameScoreRepositoryProvider],
})
export class GameScoreModule {}
