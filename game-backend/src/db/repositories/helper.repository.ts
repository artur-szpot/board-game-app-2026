import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateHelperDto } from '../../games/helpers/dto/in/create-helper.dto';
import { HelperDto } from '../../games/helpers/dto/in/helper.dto';
import { UpdateHelperDto } from '../../games/helpers/dto/in/update-helper.dto';

export interface HelperRepository {
  getHelperById(
    helperId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<HelperDto | null>;
  getHelpersByIds(
    helperIds: string[],
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<HelperDto[]>;
  getHelperByName(name: string, ownerId: string): Promise<HelperDto | null>;
  getManyHelpers(dto?: GetManyItemsDto): Promise<HelperDto[]>;
  getHelpersCount(dto?: GetManyItemsDto): Promise<number>;
  createHelper(input: CreateHelperDto, ownerId: string): Promise<HelperDto>;
  updateHelper(
    helperId: string,
    input: UpdateHelperDto,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<HelperDto>;
  deleteHelper(
    helperId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<HelperDto>;
}

export const HELPER_REPOSITORY = Symbol('HELPER_REPOSITORY');
