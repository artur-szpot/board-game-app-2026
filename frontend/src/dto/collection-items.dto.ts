import type { GameLength } from "./game-length.enum";

export type GameLocationDto = {
  locationId: string;
  note?: string;
  isGameId: boolean;
};

export type GameResponseDto = {
  id: string;
  name: string;
  description?: string;
  length: GameLength;
  tagIds: string[];
  locations: GameLocationDto[];
  scoringSchemaIds: string[];
  helperIds: string[];
  createdOn: string;
  updatedOn: string;
};

export type TagResponseDto = {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdOn: string;
  updatedOn: string;
};

export type LocationResponseDto = {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdOn: string;
  updatedOn: string;
};

export type HelperResponseDto = {
  id: string;
  name: string;
  logic: Record<string, unknown>;
  createdOn: string;
  updatedOn: string;
};

export type ScoringSchemaResponseDto = {
  id: string;
  name: string;
  description?: string;
  schema: Record<string, unknown>;
  createdOn: string;
  updatedOn: string;
};
