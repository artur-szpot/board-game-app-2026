import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { PermissionLevel } from '@auth/modules/permissions/enums/permission-level.enum';
import { PermissionType } from '@auth/modules/permissions/enums/permission-type.enum';

export class RolePermission {
  @IsEnum(PermissionType)
  @IsNotEmpty()
  permissionType: PermissionType;

  @IsEnum(PermissionLevel)
  @IsNotEmpty()
  permissionLevel: PermissionLevel;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => RolePermission)
  @ValidateNested({ each: true })
  permissions: RolePermission[];
}
