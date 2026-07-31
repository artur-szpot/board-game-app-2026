import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

import { PermissionShortResponse } from '@auth/modules/permissions/dto/out/permission-short.response';

export class RoleShortResponse {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => PermissionShortResponse)
  @ValidateNested({ each: true })
  permissions: PermissionShortResponse[];
}
