import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { RolePermission } from './create-role.dto';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => RolePermission)
  @ValidateNested({ each: true })
  @IsOptional()
  permissions?: RolePermission[];
}
