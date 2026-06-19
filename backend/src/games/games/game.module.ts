import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { GameController } from './game.controller';
import { GAME_GATEWAY } from './infrastructure/game.gateway';
import { GameService } from './infrastructure/game.service';

const gameGatewayProvider = {
  provide: GAME_GATEWAY,
  useClass: GameService,
};

@Module({
  imports: [DbModule],
  providers: [gameGatewayProvider],
  controllers: [GameController],
})
export class GameModule {}
