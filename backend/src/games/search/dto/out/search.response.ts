import { GameDataType } from '@common/enums/GameDataType.enum';

export interface SearchResult {
  id: string;
  name: string;
  type: GameDataType;
}

export interface SearchResponse {
  results: SearchResult[];
}
