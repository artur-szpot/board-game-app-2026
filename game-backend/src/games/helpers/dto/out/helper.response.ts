import {
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsString,
} from 'class-validator';

export class HelperResponse {
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
  logic: object;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
