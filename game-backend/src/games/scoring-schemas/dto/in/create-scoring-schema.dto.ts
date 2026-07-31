import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateScoringSchemaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  schema: object;

  @IsString()
  @IsOptional()
  description?: string;
}
