import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';

import { CreateTagDto } from '../../games/tags/dto/in/create-tag.dto';
import { TagDto } from '../../games/tags/dto/in/tag.dto';
import { UpdateTagDto } from '../../games/tags/dto/in/update-tag.dto';

export interface TagRepository {
  getTagById(
    tagId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto | null>;
  getTagsByIds(
    tagIds: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto[]>;
  getTagByName(name: string, ownerId: string): Promise<TagDto | null>;
  getManyTags(dto?: GetManyItemsDto): Promise<TagDto[]>;
  getTagsCount(dto?: GetManyItemsDto): Promise<number>;
  createTag(input: CreateTagDto, ownerId: string): Promise<TagDto>;
  updateTag(
    tagId: string,
    input: UpdateTagDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagDto>;
  deleteTag(tagId: string, itemOwnership?: ItemOwnershipDto): Promise<TagDto>;
}

export const TAG_REPOSITORY = Symbol('TAG_REPOSITORY');
