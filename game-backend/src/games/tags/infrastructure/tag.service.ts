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
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import { TAG_REPOSITORY, TagRepository } from '@db/repositories/tag.repository';

import { CreateTagDto } from '../dto/in/create-tag.dto';
import { TagDto } from '../dto/in/tag.dto';
import { UpdateTagDto } from '../dto/in/update-tag.dto';
import { TagResponse } from '../dto/out/tag.response';
import { TagGateway } from './tag.gateway';

@Injectable()
export class TagService implements TagGateway {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: TagRepository,
  ) {}

  private mapToResponse(tag: TagDto): TagResponse {
    return {
      id: tag.id,
      ownerId: tag.ownerId,
      private: tag.private,
      name: tag.name,
      description: tag.description ?? undefined,
      parentId: tag.parentId ?? undefined,
      createdOn: tag.createdOn,
      updatedOn: tag.updatedOn,
    };
  }

  private async getTag(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto> {
    const tag = await this.tagRepository.getTagById(id, itemOwnership);
    if (!tag) {
      this.logger.error(`Could not find tag with ID "${id}"`);
      throw new CustomNotFoundError(`tag with ID "${id}"`);
    }
    return tag;
  }

  private async ensureUniqueName(
    name: string,
    ownerId: string,
    existingTagId?: string,
  ) {
    const existingTag = await this.tagRepository.getTagByName(name, ownerId);
    if (existingTag && existingTag.id !== existingTagId) {
      throw new BadRequestException(`Tag name "${name}" is already in use`);
    }
  }

  private async ensureParentTagExists(
    parentId: string,
    userId: string,
  ): Promise<void> {
    const parentTag = await this.tagRepository.getTagById(parentId, {
      userId,
      hasCollectionSuperuserPermission: false,
    });
    if (!parentTag) {
      throw new BadRequestException(
        `Parent tag with ID "${parentId}" not found`,
      );
    }
  }

  private async ensureValidParentTag(
    tagId: string,
    parentId: string,
    userId: string,
  ): Promise<void> {
    if (tagId === parentId) {
      throw new BadRequestException('Tag cannot be its own parent');
    }

    const writeOwnership = {
      userId,
      hasCollectionSuperuserPermission: false,
    };
    const parentTag = await this.tagRepository.getTagById(
      parentId,
      writeOwnership,
    );
    if (!parentTag) {
      throw new BadRequestException(
        `Parent tag with ID "${parentId}" not found`,
      );
    }

    const visited = new Set<string>([tagId, parentId]);
    let currentParentId = parentTag.parentId;

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw new BadRequestException(
          'Tag parent relationship would create a cycle',
        );
      }
      visited.add(currentParentId);
      const currentParent = await this.tagRepository.getTagById(
        currentParentId,
        writeOwnership,
      );
      if (!currentParent) {
        break;
      }
      currentParentId = currentParent.parentId;
    }
  }

  private async validateCreateInput(input: CreateTagDto, userId: string) {
    await this.ensureUniqueName(input.name, userId);
    if (input.parentId) {
      await this.ensureParentTagExists(input.parentId, userId);
    }
  }

  private async validateUpdateInput(
    tagId: string,
    input: UpdateTagDto,
    userId: string,
  ) {
    if (input.name) {
      await this.ensureUniqueName(input.name, userId, tagId);
    }
    if (input.parentId) {
      await this.ensureValidParentTag(tagId, input.parentId, userId);
    }
  }

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse> {
    try {
      const tag = await this.getTag(id, itemOwnership);
      return this.mapToResponse(tag);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving tag with ID "${id}": ${error}`,
      );
      throw new CustomInternalError('retrieving the tag');
    }
  }

  public async getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse[]> {
    const tags = await Promise.all(
      ids.map((id) => this.getById(id, itemOwnership)),
    );
    return tags;
  }

  public async getMany(dto?: GetManyItemsDto): Promise<Paginated<TagResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.tagRepository.getManyTags(dto),
        this.tagRepository.getTagsCount(dto),
      ]);
      return {
        page: items.map((tag) => this.mapToResponse(tag)),
        total,
      };
    } catch (error) {
      this.logger.error(`Unexpected error while retrieving tags: ${error}`);
      throw new CustomInternalError('retrieving tags');
    }
  }

  public async create(
    input: CreateTagDto,
    userId?: string,
  ): Promise<TagResponse> {
    if (!userId) {
      throw new CustomInternalError('creating the tag');
    }

    try {
      await this.validateCreateInput(input, userId);
      const createdTag = await this.tagRepository.createTag(input, userId);
      return this.mapToResponse(createdTag);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating tag: ${error}`);
      throw new CustomInternalError('creating the tag');
    }
  }

  public async createSystem(input: CreateTagDto): Promise<TagResponse> {
    try {
      await this.validateCreateInput(input, SYSTEM_OWNER_ID);
      const createdTag = await this.tagRepository.createTag(
        input,
        SYSTEM_OWNER_ID,
        false,
      );
      return this.mapToResponse(createdTag);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating system tag: ${error}`);
      throw new CustomInternalError('creating the system tag');
    }
  }

  public async update(
    id: string,
    input: UpdateTagDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('updating the tag');
    }

    validateUpdateDtoNotEmpty(input);
    try {
      const visibleOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const existingTag = await this.getTag(id, visibleOwnership);
      if (
        existingTag.ownerId === SYSTEM_OWNER_ID &&
        !itemOwnership?.hasSystemCollectionFullPermission
      ) {
        throw new ForbiddenException(
          'SYSTEM_COLLECTION FULL permission is required',
        );
      }
      const writeOwnership = {
        userId: existingTag.ownerId,
        hasCollectionSuperuserPermission: false,
      };
      await this.validateUpdateInput(id, input, existingTag.ownerId);
      const updatedTag = await this.tagRepository.updateTag(
        id,
        input,
        writeOwnership,
      );
      return this.mapToResponse(updatedTag);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating tag: ${error}`);
      throw new CustomInternalError('updating the tag');
    }
  }

  public async delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('deleting the tag');
    }

    try {
      const visibleOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      const existingTag = await this.getTag(id, visibleOwnership);
      if (
        existingTag.ownerId === SYSTEM_OWNER_ID &&
        !itemOwnership?.hasSystemCollectionFullPermission
      ) {
        throw new ForbiddenException(
          'SYSTEM_COLLECTION FULL permission is required',
        );
      }
      const writeOwnership = {
        userId: existingTag.ownerId,
        hasCollectionSuperuserPermission: false,
      };
      const deletedTag = await this.tagRepository.deleteTag(id, writeOwnership);
      return this.mapToResponse(deletedTag);
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting tag: ${error}`);
      throw new CustomInternalError('deleting the tag');
    }
  }
}
