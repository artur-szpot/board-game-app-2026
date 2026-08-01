import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'test-user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: () => [PermissionShortResponse] })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => PermissionShortResponse)
  @ValidateNested({ each: true })
  permissions: PermissionShortResponse[];
}
