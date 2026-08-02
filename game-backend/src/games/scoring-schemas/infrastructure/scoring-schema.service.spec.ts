import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';

import { ScoringSchemaRepository } from '@db/repositories/scoring-schema.repository';
import { CreateScoringSchemaDto } from '../dto/in/create-scoring-schema.dto';
import { ScoringSchemaDto } from '../dto/in/scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../dto/in/update-scoring-schema.dto';
import { ScoringSchemaService } from './scoring-schema.service';

describe('ScoringSchemaService', () => {
  let mockRepository: jest.Mocked<ScoringSchemaRepository>;
  let service: ScoringSchemaService;
  const writeOwnership = {
    userId: 'user-1',
    hasCollectionSuperuserPermission: false,
  };

  const testDto: ScoringSchemaDto = {
    id: 'schema-1',
    ownerId: 'user-1',
    private: true,
    name: 'Test Schema',
    schema: {
      coins: 'number',
      products: {
        _logic: 'BEST_OF',
        wood: 'number',
        stone: 'number',
        ore: 'number',
      },
    },
    description: null,
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
  };

  beforeEach(() => {
    mockRepository = {
      getScoringSchemaById: jest.fn(),
      getScoringSchemaByName: jest.fn(),
      getManyScoringSchemas: jest.fn(),
      getScoringSchemasCount: jest.fn(),
      createScoringSchema: jest.fn(),
      updateScoringSchema: jest.fn(),
      deleteScoringSchema: jest.fn(),
    } as unknown as jest.Mocked<ScoringSchemaRepository>;

    service = new ScoringSchemaService(mockRepository);
  });

  describe('getById', () => {
    it('should return mapped response when found', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(testDto);

      const result = await service.getById(testDto.id);

      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        undefined,
      );
      expect(result).toStrictEqual({
        id: testDto.id,
        ownerId: testDto.ownerId,
        private: testDto.private,
        name: testDto.name,
        schema: testDto.schema,
        description: undefined,
        createdOn: testDto.createdOn,
        updatedOn: testDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when missing', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(null);

      await expect(service.getById(testDto.id)).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        undefined,
      );
    });

    it('should throw CustomInternalError for repository failures', async () => {
      mockRepository.getScoringSchemaById.mockRejectedValueOnce(
        new Error('fail'),
      );

      await expect(service.getById(testDto.id)).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        undefined,
      );
    });
  });

  describe('getMany', () => {
    it('returns paginated results', async () => {
      mockRepository.getManyScoringSchemas.mockResolvedValueOnce([testDto]);
      mockRepository.getScoringSchemasCount.mockResolvedValueOnce(1);

      const result = await service.getMany();

      expect(mockRepository.getManyScoringSchemas).toHaveBeenCalledWith(
        undefined,
      );
      expect(mockRepository.getScoringSchemasCount).toHaveBeenCalledWith(
        undefined,
      );
      expect(result).toStrictEqual({
        page: [
          {
            id: testDto.id,
            ownerId: testDto.ownerId,
            private: testDto.private,
            name: testDto.name,
            schema: testDto.schema,
            description: undefined,
            createdOn: testDto.createdOn,
            updatedOn: testDto.updatedOn,
          },
        ],
        total: 1,
      });
    });

    it('throws CustomInternalError on repo failure', async () => {
      mockRepository.getManyScoringSchemas.mockRejectedValueOnce(
        new Error('fail'),
      );
      mockRepository.getScoringSchemasCount.mockResolvedValueOnce(0);

      await expect(service.getMany()).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getManyScoringSchemas).toHaveBeenCalledWith(
        undefined,
      );
    });
  });

  describe('create', () => {
    it('creates when input valid', async () => {
      const createDto: CreateScoringSchemaDto = {
        name: 'New Schema',
        schema: {
          coins: 'number',
          products: {
            _logic: 'BEST_OF',
            wood: 'number',
            stone: 'number',
            ore: 'number',
          },
        },
      };

      mockRepository.getScoringSchemaByName.mockResolvedValueOnce(null);
      mockRepository.createScoringSchema.mockResolvedValueOnce(testDto);

      const result = await service.create(createDto, 'user-1');

      expect(mockRepository.getScoringSchemaByName).toHaveBeenCalledWith(
        createDto.name,
        'user-1',
      );
      expect(mockRepository.createScoringSchema).toHaveBeenCalledWith(
        createDto,
        'user-1',
      );
      expect(result.id).toBe(testDto.id);
    });

    it('throws BadRequestException when name in use', async () => {
      const createDto: CreateScoringSchemaDto = {
        name: testDto.name,
        schema: {
          coins: 'number',
          products: {
            _logic: 'BEST_OF',
            wood: 'number',
            stone: 'number',
            ore: 'number',
          },
        },
      };
      mockRepository.getScoringSchemaByName.mockResolvedValueOnce(testDto);

      await expect(service.create(createDto, 'user-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockRepository.getScoringSchemaByName).toHaveBeenCalledWith(
        createDto.name,
        'user-1',
      );
    });

    it('creates a public SYSTEM-owned scoring schema', async () => {
      const createDto: CreateScoringSchemaDto = {
        name: 'Shared Schema',
        schema: { points: 'number' },
      };
      mockRepository.getScoringSchemaByName.mockResolvedValueOnce(null);
      mockRepository.createScoringSchema.mockResolvedValueOnce({
        ...testDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      });

      await service.createSystem(createDto);

      expect(mockRepository.createScoringSchema).toHaveBeenCalledWith(
        createDto,
        SYSTEM_OWNER_ID,
        false,
      );
    });
  });

  describe('update', () => {
    it('updates existing schema', async () => {
      const updateDto: UpdateScoringSchemaDto = { name: 'Updated' };
      const updated: ScoringSchemaDto = { ...testDto, name: updateDto.name! };

      mockRepository.getScoringSchemaById.mockResolvedValueOnce(testDto);
      mockRepository.getScoringSchemaByName.mockResolvedValueOnce(null);
      mockRepository.updateScoringSchema.mockResolvedValueOnce(updated);

      const result = await service.update(
        testDto.id,
        updateDto,
        writeOwnership,
      );

      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        writeOwnership,
      );
      expect(mockRepository.getScoringSchemaByName).toHaveBeenCalledWith(
        updateDto.name,
        'user-1',
      );
      expect(mockRepository.updateScoringSchema).toHaveBeenCalledWith(
        testDto.id,
        updateDto,
        writeOwnership,
      );
      expect(result.name).toBe(updated.name);
    });

    it('throws CustomNotFoundError when missing', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(null);

      await expect(
        service.update(testDto.id, { name: 'x' }, writeOwnership),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        writeOwnership,
      );
    });

    it('denies updating a SYSTEM schema without SYSTEM_COLLECTION FULL', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce({
        ...testDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      });

      await expect(
        service.update(testDto.id, { name: 'Updated' }, writeOwnership),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockRepository.updateScoringSchema).not.toHaveBeenCalled();
    });

    it('updates a SYSTEM schema with SYSTEM_COLLECTION FULL', async () => {
      const systemSchema = {
        ...testDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      };
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(systemSchema);
      mockRepository.getScoringSchemaByName.mockResolvedValueOnce(null);
      mockRepository.updateScoringSchema.mockResolvedValueOnce({
        ...systemSchema,
        name: 'Updated',
      });

      await service.update(
        testDto.id,
        { name: 'Updated' },
        { ...writeOwnership, hasSystemCollectionFullPermission: true },
      );

      expect(mockRepository.updateScoringSchema).toHaveBeenCalledWith(
        testDto.id,
        { name: 'Updated' },
        { userId: SYSTEM_OWNER_ID, hasCollectionSuperuserPermission: false },
      );
    });
  });

  describe('delete', () => {
    it('deletes existing schema', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(testDto);
      mockRepository.deleteScoringSchema.mockResolvedValueOnce(testDto);

      const result = await service.delete(testDto.id, writeOwnership);

      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        writeOwnership,
      );
      expect(mockRepository.deleteScoringSchema).toHaveBeenCalledWith(
        testDto.id,
        writeOwnership,
      );
      expect(result.id).toBe(testDto.id);
    });

    it('throws CustomNotFoundError when missing', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(null);

      await expect(
        service.delete(testDto.id, writeOwnership),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
        writeOwnership,
      );
    });
  });
});
