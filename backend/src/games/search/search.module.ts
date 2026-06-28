import { Module } from '@nestjs/common';

import { DbModule } from '@db/db.module';

import { SearchController } from './search.controller';
import { SEARCH_GATEWAY } from './infrastructure/search.gateway';
import { SearchService } from './infrastructure/search.service';

const searchGatewayProvider = {
  provide: SEARCH_GATEWAY,
  useClass: SearchService,
};

@Module({
  imports: [DbModule],
  providers: [searchGatewayProvider],
  controllers: [SearchController],
})
export class SearchModule {}
