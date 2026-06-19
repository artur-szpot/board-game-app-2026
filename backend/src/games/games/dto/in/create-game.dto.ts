import { GameLength } from './game-length.enum';

export interface CreateGameDto {
  name: string;
  description?: string | null;
  length: GameLength;
  tagIds?: string[];
  locationIds?: string[];
  scoringSchemaIds?: string[];
  helperIds?: string[];
}
