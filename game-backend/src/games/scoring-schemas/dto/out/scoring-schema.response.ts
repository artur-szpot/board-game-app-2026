import {
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class ScoringSchemaResponse {
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
  description?: string;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
