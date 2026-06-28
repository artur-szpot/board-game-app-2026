export type SearchResultType = 'game' | 'tag' | 'location';

export interface SearchResult {
  id: string;
  name: string;
  type: SearchResultType;
}

export interface SearchResponse {
  results: SearchResult[];
}
