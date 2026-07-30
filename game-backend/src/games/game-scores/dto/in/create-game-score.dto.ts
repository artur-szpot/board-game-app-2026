export interface CreateGameScoreDto {
  gameId: string;
  playedOn?: string;
  schemaId: string;
  scores: Record<string, unknown>;
}
