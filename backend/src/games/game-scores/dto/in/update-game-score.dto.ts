export interface UpdateGameScoreDto {
  gameId?: string;
  playedOn?: string;
  schemaId?: string;
  scores?: Record<string, unknown>;
}
