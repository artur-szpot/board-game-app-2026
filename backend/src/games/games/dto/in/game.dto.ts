import { GameLength } from './game-length.enum';

export interface GameDto {
  id: string;
  name: string;
  description: string | null;
  length: GameLength;
  tagIds: string[];
  locationIds: string[];
  scoringSchemaIds: string[];
  helperIds: string[];
  createdOn: Date;
  updatedOn: Date;
}
