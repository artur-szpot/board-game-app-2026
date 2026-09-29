// Placeholder roster until the randomizer backend supplies real teams and players.
export const SCORE_PLAYERS = ["D", "B", "A", "M", "R", "E"] as const;

export type ScorePlayer = (typeof SCORE_PLAYERS)[number];
