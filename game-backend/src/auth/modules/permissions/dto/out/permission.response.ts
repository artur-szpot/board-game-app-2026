import { IsNotEmpty, IsString } from 'class-validator';

import { PermissionShortResponse } from './permission-short.response';

export class PermissionResponse extends PermissionShortResponse {
  @IsString()
  @IsNotEmpty()
  description: string;
}
