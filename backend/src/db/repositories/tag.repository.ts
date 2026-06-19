import { Pagination } from '@common/pagination/pagination';

import { CreateTagDto } from '../../games/tags/dto/in/create-tag.dto';
import { UpdateTagDto } from '../../games/tags/dto/in/update-tag.dto';
import { TagDto } from '../../games/tags/dto/in/tag.dto';

export interface TagRepository {
  getTagById(tagId: string): Promise<TagDto | null>;
  getTagsByIds(tagIds: string[]): Promise<TagDto[]>;
  getTagByName(name: string): Promise<TagDto | null>;
  getManyTags(pagination?: Pagination): Promise<TagDto[]>;
  getAllTagsCount(): Promise<number>;
  createTag(input: CreateTagDto): Promise<TagDto>;
  updateTag(tagId: string, input: UpdateTagDto): Promise<TagDto>;
  deleteTag(tagId: string): Promise<TagDto>;
}

export const TAG_REPOSITORY = Symbol('TAG_REPOSITORY');
