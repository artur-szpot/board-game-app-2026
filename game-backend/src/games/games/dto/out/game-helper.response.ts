import { ApiProperty } from '@nestjs/swagger';
import { HelperResponse } from '../../../helpers/dto/out/helper.response';
import { SetResponse } from '../../../sets/dto/out/set.response';

export class GameHelperResponse {
  @ApiProperty({ type: HelperResponse })
  helper: HelperResponse;

  @ApiProperty({ type: [SetResponse] })
  sets: SetResponse[];
}
