import { IsDateString, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class GameScoreResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsDateString()
  playedOn: string;

  @IsObject()
  schema: Record<string, unknown>;

  @IsObject()
  scores: Record<string, unknown>;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
