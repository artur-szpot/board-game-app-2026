import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';

import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import {
    HELPER_REPOSITORY,
    HelperRepository,
} from '@db/repositories/helper.repository';
import { SET_GATEWAY, SetGateway } from '../../sets/infrastructure/set.gateway';
import { CreateHelperDto } from '../dto/in/create-helper.dto';
import { HelperDto } from '../dto/in/helper.dto';
import { UpdateHelperDto } from '../dto/in/update-helper.dto';
import { HelperResponse } from '../dto/out/helper.response';
import { HelperLogic } from '../logic/helper-logic.types';
import {
    getReferencedSetIds,
    validateHelperLogic,
} from '../logic/helper-logic.validator';
import { HelperGateway } from './helper.gateway';

@Injectable()
export class HelperService implements HelperGateway {
  private readonly logger = new Logger(HelperService.name);

  constructor(
    @Inject(HELPER_REPOSITORY)
    private readonly repository: HelperRepository,
    @Inject(SET_GATEWAY)
    private readonly setGateway: SetGateway,
  ) {}

  /** Returns the set IDs the logic references once it is valid and every set is usable by `ownerId`. */
  private async validateLogic(
    logic: unknown,
    ownerId: string,
  ): Promise<string[]> {
    const errors = validateHelperLogic(logic);
    if (errors.length) {
      throw new BadRequestException(errors);
    }
    const setIds = getReferencedSetIds(logic as HelperLogic);
    const sets = await this.setGateway.getByIds(setIds, {
      userId: ownerId,
      hasCollectionSuperuserPermission: false,
    });
    const usable = new Set(
      sets
        // Public helpers must not expose private sets of other users.
        .filter(
          (set) =>
            ownerId !== SYSTEM_OWNER_ID || set.ownerId === SYSTEM_OWNER_ID,
        )
        .map((set) => set.id),
    );
    const missing = setIds.filter((id) => !usable.has(id));
    if (missing.length) {
      throw new BadRequestException(
        missing.map((id) => `Set with ID "${id}" does not exist`),
      );
    }
    return setIds;
  }

  private mapToResponse(dto: HelperDto): HelperResponse {
    return {
      id: dto.id,
      ownerId: dto.ownerId,
      private: dto.private,
      name: dto.name,
      logic: dto.logic,
      createdOn: dto.createdOn,
      updatedOn: dto.updatedOn,
    };
  }

  private async getHelper(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperDto> {
    const helper = await this.repository.getHelperById(id, itemOwnership);
    if (!helper) {
      this.logger.error(`Could not find helper with ID "${id}"`);
      throw new CustomNotFoundError(`helper with ID "${id}"`);
    }
    return helper;
  }

  public async getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse[]> {
    const helpers = await Promise.all(
      ids.map((id) => this.getById(id, itemOwnership)),
    );
    return helpers;
  }

  private async ensureUniqueName(
    name: string,
    ownerId: string,
    existingId?: string,
  ) {
    const existing = await this.repository.getHelperByName(name, ownerId);
    if (existing && existing.id !== existingId) {
      throw new BadRequestException(`Helper name "${name}" is already in use`);
    }
  }

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse> {
    try {
      const helper = await this.getHelper(id, itemOwnership);
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
    try {
      const [items, total] = await Promise.all([
        this.repository.getManyHelpers(dto),
        this.repository.getHelpersCount(dto),
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

  public async create(
    input: CreateHelperDto,
    userId?: string,
  ): Promise<HelperResponse> {
    if (!userId) {
      throw new CustomInternalError('creating the helper');
    }

    try {
      await this.ensureUniqueName(input.name, userId);
      const setIds = await this.validateLogic(input.logic, userId);
      const created = await this.repository.createHelper(
        input,
        userId,
        true,
        setIds,
      );
      return this.mapToResponse(created);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating helper: ${error}`);
      throw new CustomInternalError('creating the helper');
    }
  }

  public async createSystem(input: CreateHelperDto): Promise<HelperResponse> {
    try {
      await this.ensureUniqueName(input.name, SYSTEM_OWNER_ID);
      const setIds = await this.validateLogic(input.logic, SYSTEM_OWNER_ID);
      const created = await this.repository.createHelper(
        input,
        SYSTEM_OWNER_ID,
        false,
        setIds,
      );
      return this.mapToResponse(created);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while creating system helper: ${error}`,
      );
      throw new CustomInternalError('creating the system helper');
    }
  }

  public async update(
    id: string,
    input: UpdateHelperDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('updating the helper');
    }

    validateUpdateDtoNotEmpty(input);
    try {
      const visibleOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const existingHelper = await this.getHelper(id, visibleOwnership);
      if (
        existingHelper.ownerId === SYSTEM_OWNER_ID &&
        !itemOwnership?.hasSystemCollectionFullPermission
      ) {
        throw new ForbiddenException(
          'SYSTEM_COLLECTION FULL permission is required',
        );
      }
      const writeOwnership = {
        userId: existingHelper.ownerId,
        hasCollectionSuperuserPermission: false,
      };
      if (input.name) {
        await this.ensureUniqueName(input.name, existingHelper.ownerId, id);
      }
      const setIds =
        input.logic === undefined
          ? undefined
          : await this.validateLogic(input.logic, existingHelper.ownerId);
      const updated = await this.repository.updateHelper(
        id,
        input,
        writeOwnership,
        setIds,
      );
      return this.mapToResponse(updated);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating helper: ${error}`);
      throw new CustomInternalError('updating the helper');
    }
  }

  public async delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('deleting the helper');
    }

    try {
      const visibleOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const existingHelper = await this.getHelper(id, visibleOwnership);
      if (
        existingHelper.ownerId === SYSTEM_OWNER_ID &&
        !itemOwnership?.hasSystemCollectionFullPermission
      ) {
        throw new ForbiddenException(
          'SYSTEM_COLLECTION FULL permission is required',
        );
      }
      const writeOwnership = {
        userId: existingHelper.ownerId,
        hasCollectionSuperuserPermission: false,
      };
      const deleted = await this.repository.deleteHelper(id, writeOwnership);
      return this.mapToResponse(deleted);
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting helper: ${error}`);
      throw new CustomInternalError('deleting the helper');
    }
  }
}
