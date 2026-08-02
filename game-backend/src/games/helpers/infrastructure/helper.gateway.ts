import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateHelperDto } from '../dto/in/create-helper.dto';
import { UpdateHelperDto } from '../dto/in/update-helper.dto';
import { HelperResponse } from '../dto/out/helper.response';

export interface HelperGateway {
  getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse>;
  getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<HelperResponse>>;
  create(input: CreateHelperDto, userId?: string): Promise<HelperResponse>;
  update(
    id: string,
    input: UpdateHelperDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<HelperResponse>;
  delete(id: string, itemOwnership?: ItemOwnershipDto): Promise<HelperResponse>;
}

export const HELPER_GATEWAY = Symbol('HELPER_GATEWAY');
