import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @IsArray()
  @Type(() => UserRole)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @IsOptional()
  roles?: UserRole[];
}
