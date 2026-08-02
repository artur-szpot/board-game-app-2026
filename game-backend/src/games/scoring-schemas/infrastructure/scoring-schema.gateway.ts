import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateScoringSchemaDto } from '../dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../dto/in/update-scoring-schema.dto';
import { ScoringSchemaResponse } from '../dto/out/scoring-schema.response';

export interface ScoringSchemaGateway {
  getById(
    id: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<ScoringSchemaResponse>;
  getByIds(
    ids: string[],
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<ScoringSchemaResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<ScoringSchemaResponse>>;
  create(
    input: CreateScoringSchemaDto,
    userId?: string,
  ): Promise<ScoringSchemaResponse>;
  update(
    id: string,
    input: UpdateScoringSchemaDto,
    userId?: string,
  ): Promise<ScoringSchemaResponse>;
  delete(id: string, userId?: string): Promise<ScoringSchemaResponse>;
}

export const SCORING_SCHEMA_GATEWAY = Symbol('SCORING_SCHEMA_GATEWAY');
