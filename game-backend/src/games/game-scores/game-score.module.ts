import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { GameScoreController } from './game-score.controller';
import { GAME_SCORE_GATEWAY } from './game-score.gateway';
import { GameScoreService } from './infrastructure/game-score.service';

const gameScoreGatewayProvider = {
  provide: GAME_SCORE_GATEWAY,
  useClass: GameScoreService,
};

@Module({
  imports: [DbModule],
  controllers: [GameScoreController],
  providers: [gameScoreGatewayProvider],
  exports: [gameScoreGatewayProvider],
})
export class GameScoreModule {}
