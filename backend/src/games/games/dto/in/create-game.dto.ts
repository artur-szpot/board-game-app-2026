import { GameLength } from './game-length.enum';

export interface CreateGameLocationDto {
  locationId: string;
  note?: string;
}

export interface CreateGameDto {
  name: string;
  description?: string;
  length: GameLength;
  tagIds?: string[];
  locations?: CreateGameLocationDto[];
  scoringSchemaIds?: string[];
  helperIds?: string[];
}
