import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';

import { PermissionShortResponse } from '@auth/modules/permissions/dto/out/permission-short.response';

export class MeResponse {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => PermissionShortResponse)
  @ValidateNested({ each: true })
  permissions: PermissionShortResponse[];
}
