import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';

import { CreateScoringSchemaDto } from '../../games/scoring-schemas/dto/in/create-scoring-schema.dto';
import { ScoringSchemaDto } from '../../games/scoring-schemas/dto/in/scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../../games/scoring-schemas/dto/in/update-scoring-schema.dto';

export interface ScoringSchemaRepository {
  getScoringSchemaById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto | null>;
  getScoringSchemaByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto[]>;
  getScoringSchemaByName(
    name: string,
    ownerId: string,
  ): Promise<ScoringSchemaDto | null>;
  getManyScoringSchemas(dto?: GetManyItemsDto): Promise<ScoringSchemaDto[]>;
  getScoringSchemasCount(dto?: GetManyItemsDto): Promise<number>;
  createScoringSchema(
    input: CreateScoringSchemaDto,
    ownerId: string,
    isPrivate?: boolean,
  ): Promise<ScoringSchemaDto>;
  updateScoringSchema(
    id: string,
    input: UpdateScoringSchemaDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto>;
  deleteScoringSchema(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto>;
}

export const SCORING_SCHEMA_REPOSITORY = Symbol('SCORING_SCHEMA_REPOSITORY');
