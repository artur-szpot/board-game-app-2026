import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { RoleResponse } from '@auth/modules/roles/dto/out/role.response';

export class UserResponse {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  roles: RoleResponse[];

  @IsDateString()
  @IsNotEmpty()
  joinedDate: string;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  lastLogin?: string;
}
