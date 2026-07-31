import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';

import { PermissionResponse } from '@auth/modules/permissions/dto/out/permission.response';
import { RoleShortResponse } from './role-short.response';

export class RoleResponse extends RoleShortResponse {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  protectedRole: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => PermissionResponse)
  @ValidateNested({ each: true })
  permissions: PermissionResponse[];
}
