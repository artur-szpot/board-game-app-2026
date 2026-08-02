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

import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
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
      ownerId: dto.ownerId,
      private: dto.private,
      name: dto.name,
      schema: dto.schema,
      description: dto.description ?? undefined,
      createdOn: dto.createdOn,
      updatedOn: dto.updatedOn,
    };
  }

  private async getSchema(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaDto> {
    const schema = await this.repository.getScoringSchemaById(
      id,
      itemOwnership,
    );
    if (!schema) {
      this.logger.error(`Could not find scoring schema with ID "${id}"`);
      throw new CustomNotFoundError(`scoring schema with ID "${id}"`);
    }
    return schema;
  }

  private async ensureUniqueName(
    name: string,
    ownerId: string,
    existingId?: string,
  ) {
    const existing = await this.repository.getScoringSchemaByName(
      name,
      ownerId,
    );
    if (existing && existing.id !== existingId) {
      throw new BadRequestException(
        `Scoring schema name "${name}" is already in use`,
      );
    }
  }

  public async getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse[]> {
    const schemas = await Promise.all(
      ids.map((id) => this.getById(id, itemOwnership)),
    );
    return schemas;
  }

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse> {
    try {
      const schema = await this.getSchema(id, itemOwnership);
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
    userId?: string,
  ): Promise<ScoringSchemaResponse> {
    if (!userId) {
      throw new CustomInternalError('creating the scoring schema');
    }

    try {
      await this.ensureUniqueName(input.name, userId);
      const created = await this.repository.createScoringSchema(input, userId);
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
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('updating the scoring schema');
    }

    try {
      const writeOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      await this.getSchema(id, writeOwnership);
      if (input.name) {
        await this.ensureUniqueName(input.name, userId, id);
      }
      const updated = await this.repository.updateScoringSchema(
        id,
        input,
        writeOwnership,
      );
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

  public async delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<ScoringSchemaResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('deleting the scoring schema');
    }

    try {
      const writeOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      await this.getSchema(id, writeOwnership);
      const deleted = await this.repository.deleteScoringSchema(
        id,
        writeOwnership,
      );
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
