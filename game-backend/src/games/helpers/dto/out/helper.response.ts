import { IsDateString, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class HelperResponse {
  @IsString()
  @IsNotEmpty()
  id: string;

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
