import { ItemOwnershipDto } from '@common/dto/in/get-many-items.dto';
import { SearchQueryDto } from '../dto/in/search-query.dto';
import { SearchResponse } from '../dto/out/search.response';

export interface SearchGateway {
  search(
    query: SearchQueryDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SearchResponse>;
}

export const SEARCH_GATEWAY = Symbol('SEARCH_GATEWAY');
