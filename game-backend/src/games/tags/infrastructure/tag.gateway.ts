import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateTagDto } from '../dto/in/create-tag.dto';
import { CheckTagNameDto } from '../dto/in/check-tag-name.dto';
import { UpdateTagDto } from '../dto/in/update-tag.dto';
import { CheckResultResponse } from '../dto/out/check-result.response';
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
  checkName(
    input: CheckTagNameDto,
    userId: string,
  ): Promise<CheckResultResponse>;
  update(
    id: string,
    input: UpdateTagDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse>;
  makeSystemOwned(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<TagResponse>;
  delete(id: string, itemOwnership?: ItemOwnershipDto): Promise<TagResponse>;
}

export const TAG_GATEWAY = Symbol('TAG_GATEWAY');
