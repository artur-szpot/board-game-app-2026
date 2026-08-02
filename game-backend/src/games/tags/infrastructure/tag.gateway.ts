import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateTagDto } from '../dto/in/create-tag.dto';
import { UpdateTagDto } from '../dto/in/update-tag.dto';
import { TagResponse } from '../dto/out/tag.response';

export interface TagGateway {
  getById(id: string, itemOwnership?: ItemOwnershipDto): Promise<TagResponse>;
  getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<TagResponse>>;
  create(input: CreateTagDto, userId?: string): Promise<TagResponse>;
  createSystem(input: CreateTagDto): Promise<TagResponse>;
  update(
    id: string,
    input: UpdateTagDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse>;
  delete(id: string, itemOwnership?: ItemOwnershipDto): Promise<TagResponse>;
}

export const TAG_GATEWAY = Symbol('TAG_GATEWAY');
