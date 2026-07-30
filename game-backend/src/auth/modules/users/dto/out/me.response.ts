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
  @ValidateNested({ each: true })
  permissions: PermissionShortResponse[];
}
