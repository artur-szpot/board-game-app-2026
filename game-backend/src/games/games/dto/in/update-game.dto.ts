import { GameLength } from './game-length.enum';
import { CreateGameLocationDto } from './create-game.dto';

export interface UpdateGameDto {
  name?: string;
  description?: string | null;
  length?: GameLength;
  minPlayers?: number;
  maxPlayers?: number;
  tagIds?: string[];
  locations?: CreateGameLocationDto[];
  scoringSchemaIds?: string[];
  helperIds?: string[];
}
