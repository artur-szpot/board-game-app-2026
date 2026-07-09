import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { GameController } from './game.controller';
import { GAME_GATEWAY } from './infrastructure/game.gateway';
import { GameService } from './infrastructure/game.service';
import { TagModule } from '../tags/tag.module';
import { GameScoreModule } from '../game-scores/game-score.module';
import { ScoringSchemaModule } from '../scoring-schemas/scoring-schema.module';
import { LocationModule } from '../locations/location.module';
import { HelperModule } from '../helpers/helper.module';

const gameGatewayProvider = {
  provide: GAME_GATEWAY,
  useClass: GameService,
};

@Module({
  imports: [
    DbModule,
    TagModule,
    GameScoreModule,
    ScoringSchemaModule,
    LocationModule,
    HelperModule,
  ],
  providers: [gameGatewayProvider],
  controllers: [GameController],
})
export class GameModule {}
