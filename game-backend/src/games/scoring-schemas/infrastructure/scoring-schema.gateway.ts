import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateScoringSchemaDto } from '../dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../dto/in/update-scoring-schema.dto';
import { ScoringSchemaResponse } from '../dto/out/scoring-schema.response';

export interface ScoringSchemaGateway {
  getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse>;
  getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<ScoringSchemaResponse>>;
  create(
    input: CreateScoringSchemaDto,
    userId?: string,
  ): Promise<ScoringSchemaResponse>;
  createSystem(input: CreateScoringSchemaDto): Promise<ScoringSchemaResponse>;
  update(
    id: string,
    input: UpdateScoringSchemaDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse>;
  delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse>;
}

export const SCORING_SCHEMA_GATEWAY = Symbol('SCORING_SCHEMA_GATEWAY');
