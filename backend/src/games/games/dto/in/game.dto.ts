import { GameLength } from './game-length.enum';

export interface GameLocationPathDto {
  name: string;
  id: string;
}

export interface GameLocationDto {
  locationId: string;
  note?: string;
  isGameId: boolean;
  path: GameLocationPathDto[];
}

export interface GameTagDto {
  id: string;
  name: string;
  description?: string;
}

export interface GameDto {
  id: string;
  name: string;
  description?: string;
  length: GameLength;
  minPlayers: number;
  maxPlayers: number;
  tags: GameTagDto[];
  locations: GameLocationDto[];
  scoringSchemaIds: string[];
  helperIds: string[];
  createdOn: Date;
  updatedOn: Date;
}
