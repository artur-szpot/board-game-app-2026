import {
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class ScoringSchemaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  schema: object;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
