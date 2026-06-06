import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PermissionLevel } from '../../enums/permission-level.enum';
import { PermissionType } from '../../enums/permission-type.enum';

export class PermissionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PermissionType)
  @IsNotEmpty()
  permissionType: PermissionType;

  @IsEnum(PermissionLevel)
  @IsNotEmpty()
  @IsOptional()
  permissionLevel?: PermissionLevel;
}
