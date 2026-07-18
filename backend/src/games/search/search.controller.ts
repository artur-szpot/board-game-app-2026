import { Controller, Get, Inject, Query } from '@nestjs/common';

import { SearchQueryDto } from './dto/in/search-query.dto';
import { SearchResponse } from './dto/out/search.response';
import { SEARCH_GATEWAY, SearchGateway } from './infrastructure/search.gateway';

@Controller('game-api/search')
export class SearchController {
  constructor(
    @Inject(SEARCH_GATEWAY)
    private readonly searchGateway: SearchGateway,
  ) {}

  @Get()
  public search(@Query() query: SearchQueryDto): Promise<SearchResponse> {
    return this.searchGateway.search(query);
  }
}
