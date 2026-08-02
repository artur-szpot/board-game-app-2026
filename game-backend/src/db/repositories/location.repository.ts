import { GetManyItemsDto } from '@common/dto/in/get-many-items.dto';

import { CreateLocationDto } from '../../games/locations/dto/in/create-location.dto';
import { LocationDto } from '../../games/locations/dto/in/location.dto';
import { UpdateLocationDto } from '../../games/locations/dto/in/update-location.dto';

export interface LocationRepository {
  getLocationById(
    locationId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto | null>;
  getLocationsByIds(
    locationIds: string[],
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto[]>;
  getLocationByName(name: string, ownerId: string): Promise<LocationDto | null>;
  getManyLocations(dto?: GetManyItemsDto): Promise<LocationDto[]>;
  getLocationsCount(dto?: GetManyItemsDto): Promise<number>;
  createLocation(
    input: CreateLocationDto,
    ownerId: string,
  ): Promise<LocationDto>;
  updateLocation(
    locationId: string,
    input: UpdateLocationDto,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto>;
  deleteLocation(
    locationId: string,
    userId?: string,
    hasCollectionSuperuserPermission?: boolean,
  ): Promise<LocationDto>;
}

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');
