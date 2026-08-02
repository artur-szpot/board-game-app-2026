import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';

import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
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
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<TagDto> {
    const tag = await this.tagRepository.getTagById(
      id,
      userId,
      hasCollectionSuperuserPermission,
    );
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
    const parentTag = await this.tagRepository.getTagById(parentId, userId);
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

    const parentTag = await this.tagRepository.getTagById(parentId, userId);
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
        userId,
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
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<TagResponse> {
    try {
      const tag = await this.getTag(
        id,
        userId,
        hasCollectionSuperuserPermission,
      );
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
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<TagResponse[]> {
    const tags = await Promise.all(
      ids.map((id) =>
        this.getById(id, userId, hasCollectionSuperuserPermission),
      ),
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

  public async update(
    id: string,
    input: UpdateTagDto,
    userId?: string,
  ): Promise<TagResponse> {
    if (!userId) {
      throw new CustomInternalError('updating the tag');
    }

    validateUpdateDtoNotEmpty(input);
    try {
      await this.getTag(id, userId, false);
      await this.validateUpdateInput(id, input, userId);
      const updatedTag = await this.tagRepository.updateTag(
        id,
        input,
        userId,
        false,
      );
      return this.mapToResponse(updatedTag);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating tag: ${error}`);
      throw new CustomInternalError('updating the tag');
    }
  }

  public async delete(id: string, userId?: string): Promise<TagResponse> {
    if (!userId) {
      throw new CustomInternalError('deleting the tag');
    }

    try {
      await this.getTag(id, userId, false);
      const deletedTag = await this.tagRepository.deleteTag(id, userId, false);
      return this.mapToResponse(deletedTag);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting tag: ${error}`);
      throw new CustomInternalError('deleting the tag');
    }
  }
}
