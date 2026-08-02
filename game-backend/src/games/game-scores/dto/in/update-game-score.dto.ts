import {
    IsBoolean,
    IsDateString,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateGameScoreDto {
  @IsString()
  @IsOptional()
  gameId?: string;

  @IsDateString()
  @IsOptional()
  playedOn?: string;

  @IsString()
  @IsOptional()
  schemaId?: string;

  @IsObject()
  @IsOptional()
  scores?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
