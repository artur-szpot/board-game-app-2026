import { Pagination } from '@common/pagination/pagination';

import { CreateHelperDto } from '../../games/helpers/dto/in/create-helper.dto';
import { UpdateHelperDto } from '../../games/helpers/dto/in/update-helper.dto';
import { HelperDto } from '../../games/helpers/dto/in/helper.dto';

export interface HelperRepository {
  getHelperById(helperId: string): Promise<HelperDto | null>;
  getHelpersByIds(helperIds: string[]): Promise<HelperDto[]>;
  getHelperByName(name: string): Promise<HelperDto | null>;
  getManyHelpers(pagination?: Pagination): Promise<HelperDto[]>;
  getAllHelpersCount(): Promise<number>;
  createHelper(input: CreateHelperDto): Promise<HelperDto>;
  updateHelper(helperId: string, input: UpdateHelperDto): Promise<HelperDto>;
  deleteHelper(helperId: string): Promise<HelperDto>;
}

export const HELPER_REPOSITORY = Symbol('HELPER_REPOSITORY');
