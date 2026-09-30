import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { GameModule } from '../games/game.module';
import { HelperModule } from '../helpers/helper.module';
import { LocationModule } from '../locations/location.module';
import { ScoringSchemaModule } from '../scoring-schemas/scoring-schema.module';
import { SetModule } from '../sets/set.module';
import { TagModule } from '../tags/tag.module';
import { SEARCH_GATEWAY } from './infrastructure/search.gateway';
import { SearchService } from './infrastructure/search.service';
import { SearchController } from './search.controller';

const searchGatewayProvider = {
  provide: SEARCH_GATEWAY,
  useClass: SearchService,
};

@Module({
  imports: [
    DbModule,
    GameModule,
    TagModule,
    LocationModule,
    HelperModule,
    ScoringSchemaModule,
    SetModule,
  ],
  providers: [searchGatewayProvider],
  controllers: [SearchController],
})
export class SearchModule {}
