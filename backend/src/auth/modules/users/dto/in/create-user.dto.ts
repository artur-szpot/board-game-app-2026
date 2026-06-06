import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UserRole {
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsArray()
  @Type(() => UserRole)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  roles: UserRole[];
}
