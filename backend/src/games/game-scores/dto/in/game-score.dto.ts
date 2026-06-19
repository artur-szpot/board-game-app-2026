export interface GameScoreDto {
  id: string;
  gameId: string;
  playedOn: Date;
  schemaId: string;
  schema: Record<string, unknown>;
  scores: Record<string, unknown>;
  createdOn: Date;
  updatedOn: Date;
}
