import { IsNotEmpty, IsString } from 'class-validator';

export class GetRoleByNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
