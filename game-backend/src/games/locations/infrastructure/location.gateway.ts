import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateLocationDto } from '../dto/in/create-location.dto';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import { LocationResponse } from '../dto/out/location.response';

export interface LocationGateway {
  getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse>;
  getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<LocationResponse>>;
  create(input: CreateLocationDto, userId?: string): Promise<LocationResponse>;
  update(
    id: string,
    input: UpdateLocationDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse>;
  delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse>;
}

export const LOCATION_GATEWAY = Symbol('LOCATION_GATEWAY');
