import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { PermissionResponse } from '@auth/modules/permissions/dto/out/permission.response';

export class RoleResponse {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  protectedRole: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  permissions: PermissionResponse[];
}
