import { GameLength } from './game-length.enum';

export interface GameLocationDto {
  locationId: string;
  note?: string;
}

export interface GameDto {
  id: string;
  name: string;
  description?: string;
  length: GameLength;
  tagIds: string[];
  locations: GameLocationDto[];
  locationIds: string[];
  scoringSchemaIds: string[];
  helperIds: string[];
  createdOn: Date;
  updatedOn: Date;
}
