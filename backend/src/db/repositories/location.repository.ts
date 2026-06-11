import { Pagination } from '@common/pagination/pagination';

import { CreateLocationDto } from '../../modules/locations/dto/in/create-location.dto';
import { UpdateLocationDto } from '../../modules/locations/dto/in/update-location.dto';
import { LocationDto } from '../../modules/locations/dto/in/location.dto';

export interface LocationRepository {
  getLocationById(locationId: string): Promise<LocationDto | null>;
  getLocationByName(name: string): Promise<LocationDto | null>;
  getManyLocations(pagination?: Pagination): Promise<LocationDto[]>;
  getAllLocationsCount(): Promise<number>;
  createLocation(input: CreateLocationDto): Promise<LocationDto>;
  updateLocation(locationId: string, input: UpdateLocationDto): Promise<LocationDto>;
  deleteLocation(locationId: string): Promise<LocationDto>;
}

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');
