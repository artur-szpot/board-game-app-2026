import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';

import { CustomInternalError, CustomNotFoundError } from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import { Pagination } from '@common/pagination/pagination';

import { CreateLocationDto } from '../dto/in/create-location.dto';
import { LocationResponse } from '../dto/out/location.response';
import { LocationGateway } from './location.gateway';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import {
  LOCATION_REPOSITORY,
  LocationRepository,
} from '@db/repositories/location.repository';
import { LocationDto } from '../dto/in/location.dto';

@Injectable()
export class LocationService implements LocationGateway {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: LocationRepository,
  ) {}

  private mapToResponse(location: LocationDto): LocationResponse {
    return {
      id: location.id,
      name: location.name,
      description: location.description ?? undefined,
      parentId: location.parentId ?? undefined,
      isGameId: location.isGameId,
      createdOn: location.createdOn,
      updatedOn: location.updatedOn,
    };
  }

  private async getLocation(id: string): Promise<LocationDto> {
    const location = await this.locationRepository.getLocationById(id);
    if (!location) {
      this.logger.error(`Could not find location with ID "${id}"`);
      throw new CustomNotFoundError(`location with ID "${id}"`);
    }
    return location;
  }

  public async getByIds(ids: string[]): Promise<LocationResponse[]> {
    const locations = await Promise.all(ids.map((id) => this.getById(id)));
    return locations;
  }

  private async ensureUniqueName(name: string, existingLocationId?: string) {
    const existingLocation = await this.locationRepository.getLocationByName(name);
    if (existingLocation && existingLocation.id !== existingLocationId) {
      throw new BadRequestException(`Location name "${name}" is already in use`);
    }
  }

  private async ensureParentLocationExists(parentId: string): Promise<void> {
    const parentLocation = await this.locationRepository.getLocationById(
      parentId,
    );

    if (!parentLocation) {
      throw new BadRequestException(`Parent location with ID "${parentId}" not found`);
    }
  }

  private async ensureValidParentLocation(
    locationId: string,
    parentId: string,
  ): Promise<void> {
    if (parentId === locationId) {
      throw new BadRequestException('Location cannot be its own parent');
    }

    const parentLocation = await this.locationRepository.getLocationById(
      parentId,
    );

    if (!parentLocation) {
      throw new BadRequestException(`Parent location with ID "${parentId}" not found`);
    }

    const visited = new Set<string>([locationId, parentId]);
    let currentParentId = parentLocation.parentId;

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw new BadRequestException('Location parent relationship would create a cycle');
      }
      visited.add(currentParentId);
      const currentParent = await this.locationRepository.getLocationById(
        currentParentId,
      );
      if (!currentParent) {
        break;
      }
      currentParentId = currentParent.parentId;
    }
  }

  private async validateCreateInput(input: CreateLocationDto) {
    await this.ensureUniqueName(input.name);
    if (input.parentId) {
      await this.ensureParentLocationExists(input.parentId);
    }
  }

  private async validateUpdateInput(
    locationId: string,
    input: UpdateLocationDto,
  ) {
    if (input.name) {
      await this.ensureUniqueName(input.name, locationId);
    }
    if (input.parentId) {
      await this.ensureValidParentLocation(locationId, input.parentId);
    }
  }

  public async getById(id: string): Promise<LocationResponse> {
    try {
      const location = await this.getLocation(id);
      return this.mapToResponse(location);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(
        `Unexpected error while retrieving location with ID "${id}": ${error}`,
      );
      throw new CustomInternalError('retrieving the location');
    }
  }

  public async getMany(
    pagination?: Pagination,
  ): Promise<Paginated<LocationResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.locationRepository.getManyLocations(pagination),
        this.locationRepository.getLocationsCount(),
      ]);
      return {
        page: items.map((location) => this.mapToResponse(location)),
        total,
      };
    } catch (error) {
      this.logger.error(`Unexpected error while retrieving locations: ${error}`);
      throw new CustomInternalError('retrieving locations');
    }
  }

  public async create(
    input: CreateLocationDto,
  ): Promise<LocationResponse> {
    try {
      await this.validateCreateInput(input);
      const createdLocation = await this.locationRepository.createLocation(input);
      return this.mapToResponse(createdLocation);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error while creating location: ${error}`);
      throw new CustomInternalError('creating the location');
    }
  }

  public async update(
    id: string,
    input: UpdateLocationDto,
  ): Promise<LocationResponse> {
    validateUpdateDtoNotEmpty(input);
    try {
      await this.getLocation(id);
      await this.validateUpdateInput(id, input);
      const updatedLocation = await this.locationRepository.updateLocation(
        id,
        input,
      );
      return this.mapToResponse(updatedLocation);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating location: ${error}`);
      throw new CustomInternalError('updating the location');
    }
  }

  public async delete(id: string): Promise<LocationResponse> {
    try {
      await this.getLocation(id);
      const deletedLocation = await this.locationRepository.deleteLocation(id);
      return this.mapToResponse(deletedLocation);
    } catch (error) {
      if (error instanceof CustomNotFoundError) {
        throw error;
      }
      this.logger.error(`Unexpected error while deleting location: ${error}`);
      throw new CustomInternalError('deleting the location');
    }
  }
}
