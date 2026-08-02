import {
    IsBoolean,
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
  description?: string | null;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
