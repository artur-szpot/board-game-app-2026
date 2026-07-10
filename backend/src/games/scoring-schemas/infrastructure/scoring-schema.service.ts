import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  CustomInternalError,
  CustomNotFoundError,
} from '@common/errors/service-errors';
import { Paginated } from '@common/pagination/Paginated';
import {
  SCORING_SCHEMA_REPOSITORY,
  ScoringSchemaRepository,
} from '@db/repositories/scoring-schema.repository';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { CreateScoringSchemaDto } from '../dto/in/create-scoring-schema.dto';
import { ScoringSchemaDto } from '../dto/in/scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../dto/in/update-scoring-schema.dto';
import { ScoringSchemaResponse } from '../dto/out/scoring-schema.response';
import { ScoringSchemaGateway } from './scoring-schema.gateway';

@Injectable()
export class ScoringSchemaService implements ScoringSchemaGateway {
  private readonly logger = new Logger(ScoringSchemaService.name);

  constructor(
    @Inject(SCORING_SCHEMA_REPOSITORY)
    private readonly repository: ScoringSchemaRepository,
  ) {}

  private mapToResponse(dto: ScoringSchemaDto): ScoringSchemaResponse {
    return {
      id: dto.id,
      name: dto.name,
      schema: dto.schema,
      description: dto.description ?? undefined,
      createdOn: dto.createdOn,
      updatedOn: dto.updatedOn,
    };
  }

  private async getSchema(id: string): Promise<ScoringSchemaDto> {
    const schema = await this.repository.getScoringSchemaById(id);
    if (!schema) {
      this.logger.error(`Could not find scoring schema with ID "${id}"`);
      throw new CustomNotFoundError(`scoring schema with ID "${id}"`);
    }
    return schema;
  }

  private async ensureUniqueName(name: string, existingId?: string) {
    const existing = await this.repository.getScoringSchemaByName(name);
    if (existing && existing.id !== existingId) {
      throw new BadRequestException(
        `Scoring schema name "${name}" is already in use`,
      );
    }
  }

  public async getByIds(ids: string[]): Promise<ScoringSchemaResponse[]> {
    const schemas = await Promise.all(ids.map((id) => this.getById(id)));
    return schemas;
  }

  public async getById(id: string): Promise<ScoringSchemaResponse> {
    try {
      const schema = await this.getSchema(id);
      return this.mapToResponse(schema);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving scoring schema with ID "${id}": ${error}`,
      );
      throw new CustomInternalError('retrieving the scoring schema');
    }
  }

  public async getMany(
    dto?: GetManyItemsDto,
  ): Promise<Paginated<ScoringSchemaResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.repository.getManyScoringSchemas(dto),
        this.repository.getScoringSchemasCount(dto),
      ]);
      return {
        page: items.map((i) => this.mapToResponse(i)),
        total,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error while retrieving scoring schemas: ${error}`,
      );
      throw new CustomInternalError('retrieving scoring schemas');
    }
  }

  public async create(
    input: CreateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse> {
    try {
      await this.ensureUniqueName(input.name);
      const created = await this.repository.createScoringSchema(input);
      return this.mapToResponse(created);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while creating scoring schema: ${error}`,
      );
      throw new CustomInternalError('creating the scoring schema');
    }
  }

  public async update(
    id: string,
    input: UpdateScoringSchemaDto,
  ): Promise<ScoringSchemaResponse> {
    try {
      await this.getSchema(id);
      if (input.name) {
        await this.ensureUniqueName(input.name, id);
      }
      const updated = await this.repository.updateScoringSchema(id, input);
      return this.mapToResponse(updated);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while updating scoring schema: ${error}`,
      );
      throw new CustomInternalError('updating the scoring schema');
    }
  }

  public async delete(id: string): Promise<ScoringSchemaResponse> {
    try {
      await this.getSchema(id);
      const deleted = await this.repository.deleteScoringSchema(id);
      return this.mapToResponse(deleted);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while deleting scoring schema: ${error}`,
      );
      throw new CustomInternalError('deleting the scoring schema');
    }
  }
}
