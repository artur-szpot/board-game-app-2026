import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
  GetManyItemsDto,
  ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import {
  CustomBadRequestError,
  CustomForbiddenError,
  CustomInternalError,
  CustomNotFoundError,
} from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import { SET_REPOSITORY, SetRepository } from '@db/repositories/set.repository';

import { CreateSetDto } from '../dto/in/create-set.dto';
import { SetDto } from '../dto/in/set.dto';
import { UpdateSetDto } from '../dto/in/update-set.dto';
import { SetResponse } from '../dto/out/set.response';
import { SET_IDENTIFIER, validateSetData } from '../set-data.validator';
import { SetGateway } from './set.gateway';

const KNOWN_ERRORS = [
  BadRequestException,
  ForbiddenException,
  CustomNotFoundError,
];

@Injectable()
export class SetService implements SetGateway {
  private readonly logger = new Logger(SetService.name);

  constructor(
    @Inject(SET_REPOSITORY)
    private readonly repository: SetRepository,
  ) {}

  private mapToResponse(dto: SetDto): SetResponse {
    return {
      id: dto.id,
      ownerId: dto.ownerId,
      private: dto.private,
      name: dto.name,
      data: dto.data,
      createdOn: dto.createdOn,
      updatedOn: dto.updatedOn,
    };
  }

  private rethrowKnown(error: unknown, action: string): never {
    if (KNOWN_ERRORS.some((known) => error instanceof known)) {
      throw error;
    }
    this.logger.error(`Unexpected error while ${action}: ${error}`);
    throw new CustomInternalError(action);
  }

  private ensureValidData(data: unknown) {
    const errors = validateSetData(data);
    if (errors.length) {
      throw new CustomBadRequestError(errors);
    }
  }

  private ensureValidName(name: string) {
    if (typeof name !== 'string' || !SET_IDENTIFIER.test(name)) {
      throw new CustomBadRequestError('name must be camelCase');
    }
  }

  private async ensureUniqueName(
    name: string,
    ownerId: string,
    existingId?: string,
  ) {
    const existing = await this.repository.getSetByName(name, ownerId);
    if (existing && existing.id !== existingId) {
      throw new CustomBadRequestError(`Set name "${name}" is already in use`);
    }
  }

  private async getWritableSet(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto> {
    const existing = await this.repository.getSetById(id, {
      userId: itemOwnership?.userId,
      hasCollectionSuperuserPermission: false,
    });
    if (!existing) {
      throw new CustomNotFoundError(`set with ID "${id}"`);
    }
    if (
      existing.ownerId === SYSTEM_OWNER_ID &&
      !itemOwnership?.hasSystemCollectionFullPermission
    ) {
      throw new CustomForbiddenError(
        'SYSTEM_COLLECTION FULL permission is required',
      );
    }
    return existing;
  }

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetResponse> {
    try {
      const set = await this.repository.getSetById(id, itemOwnership);
      if (!set) {
        throw new CustomNotFoundError(`set with ID "${id}"`);
      }
      return this.mapToResponse(set);
    } catch (error) {
      this.rethrowKnown(error, 'retrieving the set');
    }
  }

  public async getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetResponse[]> {
    try {
      const sets = await this.repository.getSetsByIds(ids, itemOwnership);
      return sets.map((set) => this.mapToResponse(set));
    } catch (error) {
      this.rethrowKnown(error, 'retrieving sets');
    }
  }

  public async getMany(dto?: GetManyItemsDto): Promise<Paginated<SetResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.repository.getManySets(dto),
        this.repository.getSetsCount(dto),
      ]);
      return { page: items.map((item) => this.mapToResponse(item)), total };
    } catch (error) {
      this.rethrowKnown(error, 'retrieving sets');
    }
  }

  public async create(
    input: CreateSetDto,
    userId?: string,
  ): Promise<SetResponse> {
    if (!userId) {
      throw new CustomInternalError('creating the set');
    }
    this.ensureValidName(input.name);
    this.ensureValidData(input.data);
    try {
      await this.ensureUniqueName(input.name, userId);
      return this.mapToResponse(await this.repository.createSet(input, userId));
    } catch (error) {
      this.rethrowKnown(error, 'creating the set');
    }
  }

  public async createSystem(input: CreateSetDto): Promise<SetResponse> {
    this.ensureValidName(input.name);
    this.ensureValidData(input.data);
    try {
      await this.ensureUniqueName(input.name, SYSTEM_OWNER_ID);
      return this.mapToResponse(
        await this.repository.createSet(input, SYSTEM_OWNER_ID, false),
      );
    } catch (error) {
      this.rethrowKnown(error, 'creating the system set');
    }
  }

  public async update(
    id: string,
    input: UpdateSetDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetResponse> {
    if (!itemOwnership?.userId) {
      throw new CustomInternalError('updating the set');
    }
    validateUpdateDtoNotEmpty(input);
    if (input.name !== undefined) {
      this.ensureValidName(input.name);
    }
    if (input.data !== undefined) {
      this.ensureValidData(input.data);
    }
    try {
      const existing = await this.getWritableSet(id, itemOwnership);
      if (input.name) {
        await this.ensureUniqueName(input.name, existing.ownerId, id);
      }
      const updated = await this.repository.updateSet(id, input, {
        userId: existing.ownerId,
        hasCollectionSuperuserPermission: false,
      });
      return this.mapToResponse(updated);
    } catch (error) {
      this.rethrowKnown(error, 'updating the set');
    }
  }

  public async delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetResponse> {
    if (!itemOwnership?.userId) {
      throw new CustomInternalError('deleting the set');
    }
    try {
      const existing = await this.getWritableSet(id, itemOwnership);
      const references = await this.repository.countReferencingHelpers(id);
      if (references > 0) {
        throw new CustomBadRequestError(
          `Set is used by ${references} helper(s) and cannot be deleted`,
        );
      }
      const deleted = await this.repository.deleteSet(id, {
        userId: existing.ownerId,
        hasCollectionSuperuserPermission: false,
      });
      return this.mapToResponse(deleted);
    } catch (error) {
      this.rethrowKnown(error, 'deleting the set');
    }
  }
}
