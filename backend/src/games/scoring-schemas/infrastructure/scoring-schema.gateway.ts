import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateScoringSchemaDto } from '../dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../dto/in/update-scoring-schema.dto';
import { ScoringSchemaResponse } from '../dto/out/scoring-schema.response';

export interface ScoringSchemaGateway {
  getById(id: string): Promise<ScoringSchemaResponse>;
  getByIds(ids: string[]): Promise<ScoringSchemaResponse[]>;
  getMany(pagination?: Pagination): Promise<Paginated<ScoringSchemaResponse>>;
  create(input: CreateScoringSchemaDto): Promise<ScoringSchemaResponse>;
  update(
    id: string,
    input: UpdateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse>;
  delete(id: string): Promise<ScoringSchemaResponse>;
}

export const SCORING_SCHEMA_GATEWAY = Symbol('SCORING_SCHEMA_GATEWAY');
