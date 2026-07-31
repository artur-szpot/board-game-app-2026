import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateScoringSchemaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  schema?: object;

  @IsString()
  @IsOptional()
  description?: string | null;
}
