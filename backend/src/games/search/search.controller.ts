import { Controller, Get, Inject, Query } from '@nestjs/common';

import { paginationMapper } from '@common/pagination/mapper/pagination.mapper';

import { SearchQueryDto } from './dto/in/search-query.dto';
import { SEARCH_GATEWAY, SearchGateway } from './infrastructure/search.gateway';

@Controller('game-api/search')
export class SearchController {
  constructor(
    @Inject(SEARCH_GATEWAY)
    private readonly searchGateway: SearchGateway,
  ) {}

  @Get()
  public search(@Query() query: SearchQueryDto) {
    return this.searchGateway.search(query);
  }
}
