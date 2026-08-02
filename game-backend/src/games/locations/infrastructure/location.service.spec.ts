import { BadRequestException } from '@nestjs/common';

import {
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';
import { LocationRepository } from '@db/repositories/location.repository';

import { CreateLocationDto } from '../dto/in/create-location.dto';
import { LocationDto } from '../dto/in/location.dto';
import { UpdateLocationDto } from '../dto/in/update-location.dto';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let mockRepository: jest.Mocked<LocationRepository>;
  let service: LocationService;

  const testLocationDto: LocationDto = {
    id: 'location-1',
    ownerId: '123-abc',
    private: true,
    name: 'Test Location',
    path: ['Test Location'],
    pathIds: ['location-1'],
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

      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        undefined,
        undefined,
      );
      expect(result).toStrictEqual({
        id: testLocationDto.id,
        ownerId: testLocationDto.ownerId,
        private: testLocationDto.private,
        name: testLocationDto.name,
        description: undefined,
        parentId: undefined,
        path: [{ name: 'Test Location', id: 'location-1' }],
        createdOn: testLocationDto.createdOn,
        updatedOn: testLocationDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when location is missing', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(null);

      await expect(service.getById(testLocationDto.id)).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        undefined,
        undefined,
      );
    });

    it('should throw CustomInternalError for repository failures', async () => {
      mockRepository.getLocationById.mockRejectedValueOnce(
        new Error('failure'),
      );

      await expect(service.getById(testLocationDto.id)).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        undefined,
        undefined,
      );
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
            ownerId: testLocationDto.ownerId,
            private: testLocationDto.private,
            name: testLocationDto.name,
            description: undefined,
            parentId: undefined,
            path: [{ name: 'Test Location', id: 'location-1' }],
            createdOn: testLocationDto.createdOn,
            updatedOn: testLocationDto.updatedOn,
          },
        ],
        total: 1,
      });
    });

    it('should throw CustomInternalError for repository failures', async () => {
      mockRepository.getManyLocations.mockRejectedValueOnce(
        new Error('failure'),
      );
      mockRepository.getLocationsCount.mockResolvedValueOnce(0);

      await expect(service.getMany()).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getManyLocations).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getLocationsCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new location when input is valid', async () => {
      const createLocationDto: CreateLocationDto = {
        name: 'New Location',
      };

      mockRepository.getLocationByName.mockResolvedValueOnce(null);
      mockRepository.createLocation.mockResolvedValueOnce(testLocationDto);

      const result = await service.create(createLocationDto, '123-abc');

      expect(mockRepository.getLocationByName).toHaveBeenCalledWith(
        createLocationDto.name,
        '123-abc',
      );
      expect(mockRepository.createLocation).toHaveBeenCalledWith(
        createLocationDto,
        '123-abc',
      );
      expect(result).toStrictEqual({
        id: testLocationDto.id,
        ownerId: testLocationDto.ownerId,
        private: testLocationDto.private,
        name: testLocationDto.name,
        description: undefined,
        parentId: undefined,
        path: [{ name: 'Test Location', id: 'location-1' }],
        createdOn: testLocationDto.createdOn,
        updatedOn: testLocationDto.updatedOn,
      });
    });

    it('should throw BadRequestException when location name is already in use', async () => {
      const createLocationDto: CreateLocationDto = {
        name: testLocationDto.name,
      };

      mockRepository.getLocationByName.mockResolvedValueOnce(testLocationDto);

      await expect(
        service.create(createLocationDto, '123-abc'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockRepository.getLocationByName).toHaveBeenCalledWith(
        createLocationDto.name,
        '123-abc',
      );
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
        path: ['Updated Location'],
        pathIds: ['location-1'],
      };

      mockRepository.getLocationById.mockResolvedValueOnce(testLocationDto);
      mockRepository.getLocationByName.mockResolvedValueOnce(null);
      mockRepository.updateLocation.mockResolvedValueOnce(updatedLocationDto);

      const result = await service.update(
        testLocationDto.id,
        updateLocationDto,
        '123-abc',
      );

      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        '123-abc',
        false,
      );
      expect(mockRepository.getLocationByName).toHaveBeenCalledWith(
        updateLocationDto.name,
        '123-abc',
      );
      expect(mockRepository.updateLocation).toHaveBeenCalledWith(
        testLocationDto.id,
        updateLocationDto,
        '123-abc',
        false,
      );
      expect(result).toStrictEqual({
        id: updatedLocationDto.id,
        ownerId: updatedLocationDto.ownerId,
        private: updatedLocationDto.private,
        name: updatedLocationDto.name,
        description: undefined,
        parentId: undefined,
        path: [{ name: 'Updated Location', id: 'location-1' }],
        createdOn: updatedLocationDto.createdOn,
        updatedOn: updatedLocationDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when updating a missing location', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(null);

      await expect(
        service.update(testLocationDto.id, { name: 'New Name' }, '123-abc'),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        '123-abc',
        false,
      );
    });

    it('should reject update when a location is set as its own parent', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(testLocationDto);

      await expect(
        service.update(
          testLocationDto.id,
          { parentId: testLocationDto.id },
          '123-abc',
        ),
      ).rejects.toThrow('Location cannot be its own parent');

      expect(mockRepository.updateLocation).not.toHaveBeenCalled();
    });

    it('should reject update when parent change would create a cycle', async () => {
      mockRepository.getLocationById
        .mockResolvedValueOnce(testLocationDto)
        .mockResolvedValueOnce({
          ...testLocationDto,
          id: 'location-2',
          parentId: 'location-3',
          path: ['Location 2'],
          pathIds: ['location-2'],
        })
        .mockResolvedValueOnce({
          ...testLocationDto,
          id: 'location-3',
          parentId: 'location-1',
          path: ['Location 3'],
          pathIds: ['location-3'],
        });

      await expect(
        service.update('location-1', { parentId: 'location-2' }, '123-abc'),
      ).rejects.toThrow('Location parent relationship would create a cycle');

      expect(mockRepository.updateLocation).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing location and return its response', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(testLocationDto);
      mockRepository.deleteLocation.mockResolvedValueOnce(testLocationDto);

      const result = await service.delete(testLocationDto.id, '123-abc');

      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        '123-abc',
        false,
      );
      expect(mockRepository.deleteLocation).toHaveBeenCalledWith(
        testLocationDto.id,
        '123-abc',
        false,
      );
      expect(result).toStrictEqual({
        id: testLocationDto.id,
        ownerId: testLocationDto.ownerId,
        private: testLocationDto.private,
        name: testLocationDto.name,
        description: undefined,
        parentId: undefined,
        path: [{ name: 'Test Location', id: 'location-1' }],
        createdOn: testLocationDto.createdOn,
        updatedOn: testLocationDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when deleting a missing location', async () => {
      mockRepository.getLocationById.mockResolvedValueOnce(null);

      await expect(
        service.delete(testLocationDto.id, '123-abc'),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getLocationById).toHaveBeenCalledWith(
        testLocationDto.id,
        '123-abc',
        false,
      );
    });
  });
});
