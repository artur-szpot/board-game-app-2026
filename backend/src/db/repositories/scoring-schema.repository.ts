import { Pagination } from '@common/pagination/pagination';

import { CreateScoringSchemaDto } from '../../games/scoring-schemas/dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../../games/scoring-schemas/dto/in/update-scoring-schema.dto';
import { ScoringSchemaDto } from '../../games/scoring-schemas/dto/in/scoring-schema.dto';

export interface ScoringSchemaRepository {
  getScoringSchemaById(id: string): Promise<ScoringSchemaDto | null>;
  getScoringSchemaByName(name: string): Promise<ScoringSchemaDto | null>;
  getManyScoringSchemas(pagination?: Pagination): Promise<ScoringSchemaDto[]>;
  getAllScoringSchemasCount(): Promise<number>;
  createScoringSchema(input: CreateScoringSchemaDto): Promise<ScoringSchemaDto>;
  updateScoringSchema(id: string, input: UpdateScoringSchemaDto): Promise<ScoringSchemaDto>;
  deleteScoringSchema(id: string): Promise<ScoringSchemaDto>;
}

export const SCORING_SCHEMA_REPOSITORY = Symbol('SCORING_SCHEMA_REPOSITORY');
