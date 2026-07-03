import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateTagDto } from '../../games/tags/dto/in/create-tag.dto';
import { TagDto } from '../../games/tags/dto/in/tag.dto';
import { UpdateTagDto } from '../../games/tags/dto/in/update-tag.dto';

export interface TagRepository {
  getTagById(tagId: string): Promise<TagDto | null>;
  getTagsByIds(tagIds: string[]): Promise<TagDto[]>;
  getTagByName(name: string): Promise<TagDto | null>;
  getManyTags(dto?: GetManyItemsDto): Promise<TagDto[]>;
  getTagsCount(dto?: GetManyItemsDto): Promise<number>;
  createTag(input: CreateTagDto): Promise<TagDto>;
  updateTag(tagId: string, input: UpdateTagDto): Promise<TagDto>;
  deleteTag(tagId: string): Promise<TagDto>;
}

export const TAG_REPOSITORY = Symbol('TAG_REPOSITORY');
