export type SearchResultType = 'game' | 'tag' | 'location' | 'helper' | 'scoring-schema' | 'game-score';

export interface SearchResult {
  id: string;
  name: string;
  type: SearchResultType;
}

export interface SearchResponse {
  results: SearchResult[];
}
