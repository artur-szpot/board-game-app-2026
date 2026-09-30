import {
    IsBoolean,
    IsDateString,
    IsNotEmpty,
    IsObject,
    IsString,
} from 'class-validator';

export class SetDto {
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
  data: object;

  @IsDateString()
  createdOn: string;

  @IsDateString()
  updatedOn: string;
}
