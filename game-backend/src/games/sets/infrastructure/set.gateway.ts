import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateSetDto } from '../dto/in/create-set.dto';
import { UpdateSetDto } from '../dto/in/update-set.dto';
import { SetResponse } from '../dto/out/set.response';

export interface SetGateway {
  getById(id: string, itemOwnership?: ItemOwnershipDto): Promise<SetResponse>;
  getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<SetResponse>>;
  create(input: CreateSetDto, userId?: string): Promise<SetResponse>;
  createSystem(input: CreateSetDto): Promise<SetResponse>;
  update(
    id: string,
    input: UpdateSetDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetResponse>;
  delete(id: string, itemOwnership?: ItemOwnershipDto): Promise<SetResponse>;
}

export const SET_GATEWAY = Symbol('SET_GATEWAY');
