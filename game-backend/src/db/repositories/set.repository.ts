import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';

import { CreateSetDto } from '../../games/sets/dto/in/create-set.dto';
import { SetDto } from '../../games/sets/dto/in/set.dto';
import { UpdateSetDto } from '../../games/sets/dto/in/update-set.dto';

export interface SetRepository {
  getSetById(
    setId: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto | null>;
  getSetsByIds(
    setIds: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto[]>;
  getSetByName(name: string, ownerId: string): Promise<SetDto | null>;
  getManySets(dto?: GetManyItemsDto): Promise<SetDto[]>;
  getSetsCount(dto?: GetManyItemsDto): Promise<number>;
  countReferencingHelpers(setId: string): Promise<number>;
  createSet(
    input: CreateSetDto,
    ownerId: string,
    isPrivate?: boolean,
  ): Promise<SetDto>;
  updateSet(
    setId: string,
    input: UpdateSetDto,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<SetDto>;
  deleteSet(setId: string, itemOwnership?: ItemOwnershipDto): Promise<SetDto>;
}

export const SET_REPOSITORY = Symbol('SET_REPOSITORY');
