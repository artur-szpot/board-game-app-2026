import {
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsString,
} from 'class-validator';

export class GameScoreResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsBoolean()
  private: boolean;

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
