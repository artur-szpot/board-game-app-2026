import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateHelperDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  logic: object;
}
