import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';

import {
    GetManyItemsDto,
    ItemOwnershipDto,
} from '@common/dto/in/get-many-items.dto';
import {
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';
import { validateUpdateDtoNotEmpty } from '@common/helpers/validate-update-dto-not-empty';
import { Paginated } from '@common/pagination/Paginated';
import {
    LOCATION_REPOSITORY,
    LocationRepository,
} from '@db/repositories/location.repository';

import { CreateLocationDto } from '../dto/in/create-location.dto';
import { LocationDto } from '../dto/in/location.dto';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import { LocationResponse } from '../dto/out/location.response';
import { LocationGateway } from './location.gateway';

@Injectable()
export class LocationService implements LocationGateway {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locationRepository: LocationRepository,
  ) {}

  private async mapToResponse(
    location: LocationDto,
  ): Promise<LocationResponse> {
    return {
      id: location.id,
      ownerId: location.ownerId,
      private: location.private,
      name: location.name,
      description: location.description ?? undefined,
      parentId: location.parentId ?? undefined,
      path: location.path.map((name, index) => ({
        name,
        id: index === 0 ? location.id : location.pathIds[index - 1],
      })),
      createdOn: location.createdOn,
      updatedOn: location.updatedOn,
    };
  }

  private async getLocation(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationDto> {
    const location = await this.locationRepository.getLocationById(
      id,
      itemOwnership,
    );
    if (!location) {
      this.logger.error(`Could not find location with ID "${id}"`);
      throw new CustomNotFoundError(`location with ID "${id}"`);
    }
    return location;
  }

  public async getByIds(
    ids: string[],
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse[]> {
    const locations = await Promise.all(
      ids.map((id) => this.getById(id, itemOwnership)),
    );
    return locations;
  }

  private async ensureUniqueName(
    name: string,
    ownerId: string,
    existingLocationId?: string,
  ) {
    const existingLocation = await this.locationRepository.getLocationByName(
      name,
      ownerId,
    );
    if (existingLocation && existingLocation.id !== existingLocationId) {
      throw new BadRequestException(
        `Location name "${name}" is already in use`,
      );
    }
  }

  private async ensureParentLocationExists(
    parentId: string,
    userId: string,
  ): Promise<void> {
    const parentLocation = await this.locationRepository.getLocationById(
      parentId,
      { userId, hasCollectionSuperuserPermission: false },
    );

    if (!parentLocation) {
      throw new BadRequestException(
        `Parent location with ID "${parentId}" not found`,
      );
    }
  }

  private async ensureValidParentLocation(
    locationId: string,
    parentId: string,
    userId: string,
  ): Promise<void> {
    if (parentId === locationId) {
      throw new BadRequestException('Location cannot be its own parent');
    }

    const writeOwnership = { userId, hasCollectionSuperuserPermission: false };
    const parentLocation = await this.locationRepository.getLocationById(
      parentId,
      writeOwnership,
    );

    if (!parentLocation) {
      throw new BadRequestException(
        `Parent location with ID "${parentId}" not found`,
      );
    }

    const visited = new Set<string>([locationId, parentId]);
    let currentParentId = parentLocation.parentId;

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw new BadRequestException(
          'Location parent relationship would create a cycle',
        );
      }
      visited.add(currentParentId);
      const currentParent = await this.locationRepository.getLocationById(
        currentParentId,
        writeOwnership,
      );
      if (!currentParent) {
        break;
      }
      currentParentId = currentParent.parentId;
    }
  }

  private async validateCreateInput(input: CreateLocationDto, userId: string) {
    await this.ensureUniqueName(input.name, userId);
    if (input.parentId) {
      await this.ensureParentLocationExists(input.parentId, userId);
    }
  }

  private async validateUpdateInput(
    locationId: string,
    input: UpdateLocationDto,
    userId: string,
  ) {
    if (input.name) {
      await this.ensureUniqueName(input.name, userId, locationId);
    }
    if (input.parentId) {
      await this.ensureValidParentLocation(locationId, input.parentId, userId);
    }
  }

  public async getById(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse> {
    try {
      const location = await this.getLocation(id, itemOwnership);
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
    dto?: GetManyItemsDto,
  ): Promise<Paginated<LocationResponse>> {
    try {
      const [items, total] = await Promise.all([
        this.locationRepository.getManyLocations(dto),
        this.locationRepository.getLocationsCount(dto),
      ]);
      return {
        page: await Promise.all(
          items.map((location) => this.mapToResponse(location)),
        ),
        total,
      };
    } catch (error) {
      this.logger.error(
        `Unexpected error while retrieving locations: ${error}`,
      );
      throw new CustomInternalError('retrieving locations');
    }
  }

  public async create(
    input: CreateLocationDto,
    userId?: string,
  ): Promise<LocationResponse> {
    if (!userId) {
      throw new CustomInternalError('creating the location');
    }

    try {
      await this.validateCreateInput(input, userId);
      const createdLocation = await this.locationRepository.createLocation(
        input,
        userId,
      );
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
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('updating the location');
    }

    validateUpdateDtoNotEmpty(input);
    try {
      const writeOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      await this.getLocation(id, writeOwnership);
      await this.validateUpdateInput(id, input, userId);
      const updatedLocation = await this.locationRepository.updateLocation(
        id,
        input,
        writeOwnership,
      );
      return this.mapToResponse(updatedLocation);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof CustomNotFoundError
      ) {
        throw error;
      }
      this.logger.error(`Unexpected error while updating location: ${error}`);
      throw new CustomInternalError('updating the location');
    }
  }

  public async delete(
    id: string,
    itemOwnership?: ItemOwnershipDto,
  ): Promise<LocationResponse> {
    const userId = itemOwnership?.userId;
    if (!userId) {
      throw new CustomInternalError('deleting the location');
    }

    try {
      const writeOwnership = {
        userId,
        hasCollectionSuperuserPermission: false,
      };
      await this.getLocation(id, writeOwnership);
      const deletedLocation = await this.locationRepository.deleteLocation(
        id,
        writeOwnership,
      );
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
