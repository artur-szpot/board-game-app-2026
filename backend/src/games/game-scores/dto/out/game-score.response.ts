export interface GameScoreResponse {
  id: string;
  gameId: string;
  playedOn: string;
  schema: Record<string, unknown>;
  scores: Record<string, unknown>;
  createdOn: string;
  updatedOn: string;
}
