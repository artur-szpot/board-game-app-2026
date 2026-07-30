import { AuthSearchQueryDto } from '../dto/in/auth-search-query.dto';
import { AuthSearchResponse } from '../dto/out/auth-search.response';

export interface AuthSearchGateway {
  search(query: AuthSearchQueryDto): Promise<AuthSearchResponse>;
}

export const AUTH_SEARCH_GATEWAY = Symbol('AUTH_SEARCH_GATEWAY');
