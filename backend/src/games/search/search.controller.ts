import { Body, Controller, Inject, Post } from '@nestjs/common';

import { SearchQueryDto } from './dto/in/search-query.dto';
import { SearchResponse } from './dto/out/search.response';
import { SEARCH_GATEWAY, SearchGateway } from './infrastructure/search.gateway';

@Controller('game-api/search')
export class SearchController {
  constructor(
    @Inject(SEARCH_GATEWAY)
    private readonly searchGateway: SearchGateway,
  ) {}

  @Post()
  public search(@Body() query: SearchQueryDto): Promise<SearchResponse> {
    return this.searchGateway.search(query);
  }
}
