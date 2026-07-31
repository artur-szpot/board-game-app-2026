import { IsDate, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class GameScoreDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsDate()
  playedOn: Date;

  @IsString()
  @IsNotEmpty()
  schemaId: string;

  @IsObject()
  schema: Record<string, unknown>;

  @IsObject()
  scores: Record<string, unknown>;

  @IsDate()
  createdOn: Date;

  @IsDate()
  updatedOn: Date;
}
