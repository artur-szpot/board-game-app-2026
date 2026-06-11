import { BadRequestException } from '@nestjs/common';

import {
  CustomInternalError,
  CustomNotFoundError,
} from '@common/errors/service-errors';

import { CreateScoringSchemaDto } from '../dto/in/create-scoring-schema.dto';
import { UpdateScoringSchemaDto } from '../dto/in/update-scoring-schema.dto';
import { ScoringSchemaDto } from '../dto/in/scoring-schema.dto';
import { ScoringSchemaRepository } from '@db/repositories/scoring-schema.repository';
import { ScoringSchemaService } from './scoring-schema.service';

describe('ScoringSchemaService', () => {
  let mockRepository: jest.Mocked<ScoringSchemaRepository>;
  let service: ScoringSchemaService;

  const testDto: ScoringSchemaDto = {
    id: 'schema-1',
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
      getAllScoringSchemasCount: jest.fn(),
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
      );
      expect(result).toStrictEqual({
        id: testDto.id,
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
      );
    });
  });

  describe('getMany', () => {
    it('returns paginated results', async () => {
      mockRepository.getManyScoringSchemas.mockResolvedValueOnce([testDto]);
      mockRepository.getAllScoringSchemasCount.mockResolvedValueOnce(1);

      const result = await service.getMany();

      expect(mockRepository.getManyScoringSchemas).toHaveBeenCalledWith(
        undefined,
      );
      expect(mockRepository.getAllScoringSchemasCount).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        page: [
          {
            id: testDto.id,
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
      mockRepository.getAllScoringSchemasCount.mockResolvedValueOnce(0);

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

      const result = await service.create(createDto);

      expect(mockRepository.getScoringSchemaByName).toHaveBeenCalledWith(
        createDto.name,
      );
      expect(mockRepository.createScoringSchema).toHaveBeenCalledWith(
        createDto,
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

      await expect(service.create(createDto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(mockRepository.getScoringSchemaByName).toHaveBeenCalledWith(
        createDto.name,
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

      const result = await service.update(testDto.id, updateDto);

      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
      );
      expect(mockRepository.getScoringSchemaByName).toHaveBeenCalledWith(
        updateDto.name,
      );
      expect(mockRepository.updateScoringSchema).toHaveBeenCalledWith(
        testDto.id,
        updateDto,
      );
      expect(result.name).toBe(updated.name);
    });

    it('throws CustomNotFoundError when missing', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(null);

      await expect(
        service.update(testDto.id, { name: 'x' }),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
      );
    });
  });

  describe('delete', () => {
    it('deletes existing schema', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(testDto);
      mockRepository.deleteScoringSchema.mockResolvedValueOnce(testDto);

      const result = await service.delete(testDto.id);

      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
      );
      expect(mockRepository.deleteScoringSchema).toHaveBeenCalledWith(
        testDto.id,
      );
      expect(result.id).toBe(testDto.id);
    });

    it('throws CustomNotFoundError when missing', async () => {
      mockRepository.getScoringSchemaById.mockResolvedValueOnce(null);

      await expect(service.delete(testDto.id)).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getScoringSchemaById).toHaveBeenCalledWith(
        testDto.id,
      );
    });
  });
});
