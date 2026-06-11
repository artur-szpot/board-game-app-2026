import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateLocationDto } from '../dto/in/create-location.dto';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import { LocationResponse } from '../dto/out/location.response';

export interface LocationGateway {
  getById(id: string): Promise<LocationResponse>;
  getMany(pagination?: Pagination): Promise<Paginated<LocationResponse>>;
  create(input: CreateLocationDto): Promise<LocationResponse>;
  update(id: string, input: UpdateLocationDto): Promise<LocationResponse>;
  delete(id: string): Promise<LocationResponse>;
}

export const LOCATION_GATEWAY = Symbol('LOCATION_GATEWAY');
