import type { GameLength } from "./game-length.enum";

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
  helperIds: string[];
  createdOn: string;
  updatedOn: string;
};

export type TagResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  description?: string;
  parentId?: string;
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

export type HelperResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  logic: Record<string, unknown>;
  createdOn: string;
  updatedOn: string;
};

export type ScoringSchemaResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  name: string;
  description?: string;
  schema: Record<string, unknown>;
  createdOn: string;
  updatedOn: string;
};
