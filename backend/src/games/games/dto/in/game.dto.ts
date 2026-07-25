import { GameLength } from './game-length.enum';

export interface GameLocationDto {
  locationId: string;
  note?: string;
  isGameId: boolean;
}

export interface GameDto {
  id: string;
  name: string;
  description?: string;
  length: GameLength;
  tagIds: string[];
  locations: GameLocationDto[];
  scoringSchemaIds: string[];
  helperIds: string[];
  createdOn: Date;
  updatedOn: Date;
}
