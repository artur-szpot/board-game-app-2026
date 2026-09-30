import type { GameLength } from "./game-length.enum";
import type { HelperLogic, SetDataDto } from "./helper-logic.dto";
import type { ScoringSchemaDefinition } from "./scoring-schema.dto";

export type GameLocationPathDto = {
  name: string;
  id: string;
};

export type GameLocationDto = {
  locationId: string;
  note?: string;
  isGameId: boolean;
  path: GameLocationPathDto[];
};

export type GameTagResponseDto = {
  id: string;
  name: string;
  description?: string;
};

export type HelperResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  logic: HelperLogic;
  createdOn: string;
  updatedOn: string;
};

export type SetResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  data: SetDataDto;
  createdOn: string;
  updatedOn: string;
};

export type ScoringSchemaResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  description?: string;
  schema: ScoringSchemaDefinition;
  createdOn: string;
  updatedOn: string;
};

export type GameResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  description?: string;
  length: GameLength;
  minPlayers: number;
  maxPlayers: number;
  tags: GameTagResponseDto[];
  locations: GameLocationDto[];
  scoringSchemaIds: string[];
  scoringSchemas: ScoringSchemaResponseDto[];
  helperIds: string[];
  helpers: HelperResponseDto[];
  createdOn: string;
  updatedOn: string;
};

export type TagResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  description?: string;
  parent?: {
    id: string;
    name: string;
  };
  createdOn: string;
  updatedOn: string;
};

export type LocationResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  description?: string;
  parentId?: string;
  path: GameLocationPathDto[];
  createdOn: string;
  updatedOn: string;
};
