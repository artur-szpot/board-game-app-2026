import { Pagination } from '@common/pagination/pagination';

import { CreateLocationDto } from '../../games/locations/dto/in/create-location.dto';
import { UpdateLocationDto } from '../../games/locations/dto/in/update-location.dto';
import { LocationDto } from '../../games/locations/dto/in/location.dto';

export interface LocationRepository {
  getLocationById(locationId: string): Promise<LocationDto | null>;
  getLocationsByIds(locationIds: string[]): Promise<LocationDto[]>;
  getLocationByName(name: string): Promise<LocationDto | null>;
  getManyLocations(pagination?: Pagination): Promise<LocationDto[]>;
  getAllLocationsCount(): Promise<number>;
  createLocation(input: CreateLocationDto): Promise<LocationDto>;
  updateLocation(locationId: string, input: UpdateLocationDto): Promise<LocationDto>;
  deleteLocation(locationId: string): Promise<LocationDto>;
}

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');
