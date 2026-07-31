import {
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateGameScoreDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsDateString()
  @IsOptional()
  playedOn?: string;

  @IsString()
  @IsNotEmpty()
  schemaId: string;

  @IsObject()
  scores: Record<string, unknown>;
}
