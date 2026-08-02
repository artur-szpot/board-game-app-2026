import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';
import { Paginated } from '@common/pagination/Paginated';

import { CreateLocationDto } from '../dto/in/create-location.dto';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import { LocationResponse } from '../dto/out/location.response';

export interface LocationGateway {
  getById(
    id: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationResponse>;
  getByIds(
    ids: string[],
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationResponse[]>;
  getMany(dto?: GetManyItemsDto): Promise<Paginated<LocationResponse>>;
  create(input: CreateLocationDto, userId?: string): Promise<LocationResponse>;
  update(
    id: string,
    input: UpdateLocationDto,
    userId?: string,
  ): Promise<LocationResponse>;
  delete(id: string, userId?: string): Promise<LocationResponse>;
}

export const LOCATION_GATEWAY = Symbol('LOCATION_GATEWAY');
