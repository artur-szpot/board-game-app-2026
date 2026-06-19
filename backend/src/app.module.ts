import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from '@auth/auth.module';
import { DbModule } from '@db/db.module';

import config from './config/config';
import { GameScoreModule } from './games/game-scores/game-score.module';
import { GameModule } from './games/games/game.module';
import { HelperModule } from './games/helpers/helper.module';
import { LocationModule } from './games/locations/location.module';
import { ScoringSchemaModule } from './games/scoring-schemas/scoring-schema.module';
import { TagModule } from './games/tags/tag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    AuthModule,
    DbModule,
    LocationModule,
    TagModule,
    ScoringSchemaModule,
    GameScoreModule,
    HelperModule,
    GameModule,
  ],
})
export class AppModule {}
