import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateHelperDto } from '../dto/in/create-helper.dto';
import { UpdateHelperDto } from '../dto/in/update-helper.dto';
import { HelperResponse } from '../dto/out/helper.response';

export interface HelperGateway {
  getById(id: string): Promise<HelperResponse>;
  getByIds(ids: string[]): Promise<HelperResponse[]>;
  getMany(pagination?: Pagination): Promise<Paginated<HelperResponse>>;
  create(input: CreateHelperDto): Promise<HelperResponse>;
  update(id: string, input: UpdateHelperDto): Promise<HelperResponse>;
  delete(id: string): Promise<HelperResponse>;
}

export const HELPER_GATEWAY = Symbol('HELPER_GATEWAY');
