import {
    IsBoolean,
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
  ownerId: string;

  @IsBoolean()
  private: boolean;

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
