import { ScoringGroupMechanism } from './scoring-group-mechanism.enum';
import {
    SCORING_SCHEMA_VERSION,
    ScoringSchemaDefinitionDto,
} from './scoring-schema-definition.dto';

export const testScoringSchemaDefinition = (): ScoringSchemaDefinitionDto => ({
  version: SCORING_SCHEMA_VERSION,
  groups: [
    {
      id: 'group-1',
      name: 'Main',
      mechanism: ScoringGroupMechanism.SUM_ALL,
      categories: [
        {
          id: 'category-1',
          name: 'Resources',
          rows: [
            { id: 'row-coins', name: 'Coins' },
            { id: 'row-wood', name: 'Wood' },
          ],
        },
      ],
    },
    {
      id: 'group-2',
      name: 'Products',
      mechanism: ScoringGroupMechanism.GREATEST_ONLY,
      categories: [
        {
          id: 'category-2',
          name: 'Stone',
          rows: [{ id: 'row-stone', icon: 'castle' }],
        },
        {
          id: 'category-3',
          name: 'Ore',
          rows: [{ id: 'row-ore', name: 'Ore' }],
        },
      ],
    },
  ],
});
