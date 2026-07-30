import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateHelperDto } from '../../games/helpers/dto/in/create-helper.dto';
import { HelperDto } from '../../games/helpers/dto/in/helper.dto';
import { UpdateHelperDto } from '../../games/helpers/dto/in/update-helper.dto';

export interface HelperRepository {
  getHelperById(helperId: string): Promise<HelperDto | null>;
  getHelpersByIds(helperIds: string[]): Promise<HelperDto[]>;
  getHelperByName(name: string): Promise<HelperDto | null>;
  getManyHelpers(dto?: GetManyItemsDto): Promise<HelperDto[]>;
  getHelpersCount(dto?: GetManyItemsDto): Promise<number>;
  createHelper(input: CreateHelperDto): Promise<HelperDto>;
  updateHelper(helperId: string, input: UpdateHelperDto): Promise<HelperDto>;
  deleteHelper(helperId: string): Promise<HelperDto>;
}

export const HELPER_REPOSITORY = Symbol('HELPER_REPOSITORY');
