export enum ScoringGroupMechanism {
  SUM_ALL = "SUM_ALL",
  SUM_ALL_PLUS_SMALLEST = "SUM_ALL_PLUS_SMALLEST",
  GREATEST_ONLY = "GREATEST_ONLY",
  SMALLEST_ONLY = "SMALLEST_ONLY",
}

export const SCORING_GROUP_MECHANISM_LABELS: Record<
  ScoringGroupMechanism,
  string
> = {
  [ScoringGroupMechanism.SUM_ALL]: "Sum all",
  [ScoringGroupMechanism.SUM_ALL_PLUS_SMALLEST]: "Sum all plus smallest",
  [ScoringGroupMechanism.GREATEST_ONLY]: "Greatest only",
  [ScoringGroupMechanism.SMALLEST_ONLY]: "Smallest only",
};

export const SCORING_SCHEMA_VERSION = 1;

export type ScoringRow = {
  id: string;
  name?: string;
  icon?: string;
};

export type ScoringCategory = {
  id: string;
  name?: string;
  rows: ScoringRow[];
};

export type ScoringGroup = {
  id: string;
  name?: string;
  mechanism: ScoringGroupMechanism;
  categories: ScoringCategory[];
};

export type ScoringSchemaDefinition = {
  version: number;
  groups: ScoringGroup[];
};

/** rowId -> player -> score; both levels are sparse while a sheet is being filled in. */
export type ScoreValues = Record<
  string,
  Record<string, number | undefined> | undefined
>;

export type GameScoreValues = {
  players: string[];
  values: ScoreValues;
};

export type GameScoreResponseDto = {
  id: string;
  ownerId: string;
  private: boolean;
  gameId: string;
  playedOn: string;
  schemaId: string;
  schema?: ScoringSchemaDefinition;
  schemaName?: string;
  scores: GameScoreValues;
  createdOn: string;
  updatedOn: string;
};
