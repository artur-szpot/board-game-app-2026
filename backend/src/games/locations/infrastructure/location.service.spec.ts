import { BadRequestException } from '@nestjs/common';

import { CustomInternalError, CustomNotFoundError } from '@common/errors/service-errors';
import { CreateLocationDto } from '../dto/in/create-location.dto';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import { LocationDto } from '../dto/in/location.dto';
import { LocationRepository } from '@db/repositories/location.repository';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let mockRepository: jest.Mocked<LocationRepository>;
  let service: LocationService;

  const testLocationDto: LocationDto = {
    id: 'location-1',
    name: 'Test Location',
    isGameId: false,
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
  };

  beforeEach(() => {
    mockRepository = {
      getLocationById: jest.fn(),
      getLocationByName: jest.fn(),
      getManyLocations: jest.fn(),
      getLocationsCount: jest.fn(),
      createLocation: jest.fn(),
      updateLocation: jest.fn(),
      deleteLocation: jest.fn(),
    } as unknown as jest.Mocked<LocationRepository>;

    service = new LocationService(mockRepository);
  });

  describe('getById', () => {
    it('should return a mapped location response when found', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(testLocationDto);

      const result = await service.getById(testLocationDto.id);

      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
      expect(result).toStrictEqual({
        id: testLocationDto.id,
        name: testLocationDto.name,
        description: undefined,
        parentId: undefined,
        isGameId: false,
        createdOn: testLocationDto.createdOn,
        updatedOn: testLocationDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when location is missing', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(null);

      await expect(service.getById(testLocationDto.id)).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
    });

    it('should throw CustomInternalError for repository failures', async () => {
      mockRepository.getLocationById.mockRejectedValueOnce(new Error('failure'));

      await expect(service.getById(testLocationDto.id)).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
    });
  });

  describe('getMany', () => {
    it('should return a paginated list of locations', async () => {
      mockRepository.getManyLocations.mockResolvedValueOnce([testLocationDto]);
      mockRepository.getLocationsCount.mockResolvedValueOnce(1);

      const result = await service.getMany();

      expect(mockRepository.getManyLocations).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getLocationsCount).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        page: [
          {
            id: testLocationDto.id,
            name: testLocationDto.name,
            description: undefined,
            parentId: undefined,
            isGameId: false,
            createdOn: testLocationDto.createdOn,
            updatedOn: testLocationDto.updatedOn,
          },
        ],
        total: 1,
      });
    });

    it('should throw CustomInternalError for repository failures', async () => {
      mockRepository.getManyLocations.mockRejectedValueOnce(new Error('failure'));
      mockRepository.getLocationsCount.mockResolvedValueOnce(0);

      await expect(service.getMany()).rejects.toBeInstanceOf(CustomInternalError);
      expect(mockRepository.getManyLocations).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getLocationsCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new location when input is valid', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'New Location',
        isGameId: false,
      };

      mockRepository.getLocationByName.mockResolvedValueOnce(null);
      mockRepository.createLocation.mockResolvedValueOnce(testLocationDto);

      const result = await service.create(createLocationDto);

      expect(mockRepository.getLocationByName).toHaveBeenCalledWith(createLocationDto.name);
      expect(mockRepository.createLocation).toHaveBeenCalledWith(createLocationDto);
      expect(result).toStrictEqual({
        id: testLocationDto.id,
        name: testLocationDto.name,
        description: undefined,
        parentId: undefined,
        isGameId: false,
        createdOn: testLocationDto.createdOn,
        updatedOn: testLocationDto.updatedOn,
      });
    });

    it('should throw BadRequestException when location name is already in use', async () => {
      const createLocationDto: CreateLocationDto = {
        name: testLocationDto.name,
        isGameId: false,
      };

      mockRepository.getLocationByName.mockResolvedValueOnce(testLocationDto);

      await expect(service.create(createLocationDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockRepository.getLocationByName).toHaveBeenCalledWith(createLocationDto.name);
    });
  });

  describe('update', () => {
    it('should update an existing location with valid input', async () => {
      const updateLocationDto: UpdateLocationDto = {
        name: 'Updated Location',
      };

      const updatedLocationDto: LocationDto = {
        ...testLocationDto,
        name: updateLocationDto.name,
      };

      mockRepository.getLocationById.mockResolvedValueOnce(testLocationDto);
      mockRepository.getLocationByName.mockResolvedValueOnce(null);
      mockRepository.updateLocation.mockResolvedValueOnce(updatedLocationDto);

      const result = await service.update(testLocationDto.id, updateLocationDto);

      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
      expect(mockRepository.getLocationByName).toHaveBeenCalledWith(updateLocationDto.name);
      expect(mockRepository.updateLocation).toHaveBeenCalledWith(
        testLocationDto.id,
        updateLocationDto,
      );
      expect(result).toStrictEqual({
        id: updatedLocationDto.id,
        name: updatedLocationDto.name,
        description: undefined,
        parentId: undefined,
        isGameId: false,
        createdOn: updatedLocationDto.createdOn,
        updatedOn: updatedLocationDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when updating a missing location', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(null);

      await expect(service.update(testLocationDto.id, { name: 'New Name' })).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
    });
  });

  describe('delete', () => {
    it('should delete an existing location and return its response', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(testLocationDto);
      mockRepository.deleteLocation.mockResolvedValueOnce(testLocationDto);

      const result = await service.delete(testLocationDto.id);

      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
      expect(mockRepository.deleteLocation).toHaveBeenCalledWith(testLocationDto.id);
      expect(result).toStrictEqual({
        id: testLocationDto.id,
        name: testLocationDto.name,
        description: undefined,
        parentId: undefined,
        isGameId: false,
        createdOn: testLocationDto.createdOn,
        updatedOn: testLocationDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when deleting a missing location', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(null);

      await expect(service.delete(testLocationDto.id)).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(testLocationDto.id);
    });
  });
});
