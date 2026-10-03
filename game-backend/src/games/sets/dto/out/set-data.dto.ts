import { ApiProperty } from '@nestjs/swagger';
import { SET_IDENTIFIER } from '../../set-data.validator';

export class SetItemDataDto {
  @ApiProperty({ pattern: SET_IDENTIFIER.source })
  name: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  properties: Record<string, string>;
}

export class SetDataDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', pattern: SET_IDENTIFIER.source },
    minItems: 1,
    uniqueItems: true,
  })
  properties: string[];

  @ApiProperty({
    type: [SetItemDataDto],
    minItems: 1,
    description:
      'Items have unique names within their set and exactly the declared property keys.',
  })
  items: SetItemDataDto[];
}
