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
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateHelperDto } from '../dto/in/create-helper.dto';
import { HelperDto } from '../dto/in/helper.dto';
import { HelperResponse } from '../dto/out/helper.response';
import { UpdateHelperDto } from '../dto/in/update-helper.dto';
import {
  HELPER_REPOSITORY,
  HelperRepository,
} from '@db/repositories/helper.repository';
import { HelperGateway } from './helper.gateway';
import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

@Injectable()
export class HelperService implements HelperGateway {
  private readonly logger = new Logger(HelperService.name);

  constructor(
    @Inject(HELPER_REPOSITORY)
    private readonly repository: HelperRepository,
  ) {}

  private mapToResponse(dto: HelperDto): HelperResponse {
    return {
      id: dto.id,
      name: dto.name,
      logic: dto.logic,
      createdOn: dto.createdOn,
      updatedOn: dto.updatedOn,
    };
  }

  private async getHelper(id: string): Promise<HelperDto> {
    const helper = await this.repository.getHelperById(id);
    if (!helper) {
      this.logger.error(`Could not find helper with ID "${id}"`);
      throw new CustomNotFoundError(`helper with ID "${id}"`);
    }
    return helper;
  }

  public async getByIds(ids: string[]): Promise<HelperResponse[]> {
    const helpers = await Promise.all(ids.map((id) => this.getById(id)));
    return helpers;
  }

  private async ensureUniqueName(name: string, existingId?: string) {
    const existing = await this.repository.getHelperByName(name);
    if (existing && existing.id !== existingId) {
      throw new BadRequestException(`Helper name "${name}" is already in use`);
    }
  }

  public async getById(id: string): Promise<HelperResponse> {
    try {
      const helper = await this.getHelper(id);
      return this.mapToResponse(helper);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving helper with ID "${id}": ${error}`,
      );
      throw new CustomInternalError('retrieving the helper');
    }
  }

  public async getMany(
    dto?: GetManyItemsDto,
  ): Promise<Paginated<HelperResponse>> {
    const { pagination } = dto;
    try {
      const [items, total] = await Promise.all([
        this.repository.getManyHelpers({ pagination }),
        this.repository.getHelpersCount(),
      ]);
      return {
        page: items.map((item) => this.mapToResponse(item)),
        total,
      };
    } catch (error) {
      this.logger.error(`Unexpected error while retrieving helpers: ${error}`);
      throw new CustomInternalError('retrieving helpers');
    }
  }

  public async create(input: CreateHelperDto): Promise<HelperResponse> {
    try {
      await this.ensureUniqueName(input.name);
      const created = await this.repository.createHelper(input);
      return this.mapToResponse(created);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating helper: ${error}`);
      throw new CustomInternalError('creating the helper');
    }
  }

  public async update(
    id: string,
    input: UpdateHelperDto,
  ): Promise<HelperResponse> {
    validateUpdateDtoNotEmpty(input);
    try {
      await this.getHelper(id);
      if (input.name) {
        await this.ensureUniqueName(input.name, id);
      }
      const updated = await this.repository.updateHelper(id, input);
      return this.mapToResponse(updated);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating helper: ${error}`);
      throw new CustomInternalError('updating the helper');
    }
  }

  public async delete(id: string): Promise<HelperResponse> {
    try {
      await this.getHelper(id);
      const deleted = await this.repository.deleteHelper(id);
      return this.mapToResponse(deleted);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting helper: ${error}`);
      throw new CustomInternalError('deleting the helper');
    }
  }
}
