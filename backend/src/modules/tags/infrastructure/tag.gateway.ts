import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateTagDto } from '../dto/in/create-tag.dto';
import { UpdateTagDto } from '../dto/in/update-tag.dto';
import { TagResponse } from '../dto/out/tag.response';

export interface TagGateway {
  getById(id: string): Promise<TagResponse>;
  getMany(pagination?: Pagination): Promise<Paginated<TagResponse>>;
  create(input: CreateTagDto): Promise<TagResponse>;
  update(id: string, input: UpdateTagDto): Promise<TagResponse>;
  delete(id: string): Promise<TagResponse>;
}

export const TAG_GATEWAY = Symbol('TAG_GATEWAY');
