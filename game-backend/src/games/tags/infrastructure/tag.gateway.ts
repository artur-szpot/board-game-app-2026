import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateTagDto } from '../dto/in/create-tag.dto';
import { UpdateTagDto } from '../dto/in/update-tag.dto';
import { TagResponse } from '../dto/out/tag.response';

export interface TagGateway {
  getById(id: string): Promise<TagResponse>;
  getByIds(ids: string[]): Promise<TagResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<TagResponse>>;
  create(input: CreateTagDto): Promise<TagResponse>;
  update(id: string, input: UpdateTagDto): Promise<TagResponse>;
  delete(id: string): Promise<TagResponse>;
}

export const TAG_GATEWAY = Symbol('TAG_GATEWAY');
