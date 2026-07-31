import { IsDateString, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class HelperDto {
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
