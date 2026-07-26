import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { GameModule } from '../games/game.module';
import { HelperModule } from '../helpers/helper.module';
import { LocationModule } from '../locations/location.module';
import { ScoringSchemaModule } from '../scoring-schemas/scoring-schema.module';
import { TagModule } from '../tags/tag.module';
import { SearchController } from './search.controller';
import { SEARCH_GATEWAY } from './infrastructure/search.gateway';
import { SearchService } from './infrastructure/search.service';

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
  ],
  providers: [searchGatewayProvider],
  controllers: [SearchController],
})
export class SearchModule {}
