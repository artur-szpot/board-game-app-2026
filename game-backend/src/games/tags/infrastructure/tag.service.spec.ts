import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import {
    CustomInternalError,
    CustomNotFoundError,
} from '@common/errors/service-errors';
import { TagRepository } from '@db/repositories/tag.repository';
import { CreateTagDto } from '../dto/in/create-tag.dto';
import { TagDto } from '../dto/in/tag.dto';
import { UpdateTagDto } from '../dto/in/update-tag.dto';
import { TagService } from './tag.service';

describe('TagService', () => {
  let mockRepository: jest.Mocked<TagRepository>;
  let service: TagService;
  const writeOwnership = {
    userId: '123-abc',
    hasCollectionSuperuserPermission: false,
  };

  const testTagDto: TagDto = {
    id: 'tag-1',
    ownerId: '123-abc',
    private: true,
    name: 'Test Tag',
    description: 'Test tag description',
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
  };

  beforeEach(() => {
    mockRepository = {
      getTagById: jest.fn(),
      getTagByName: jest.fn(),
      getManyTags: jest.fn(),
      getTagsCount: jest.fn(),
      createTag: jest.fn(),
      updateTag: jest.fn(),
      makeTagSystemOwned: jest.fn(),
      deleteTag: jest.fn(),
    } as unknown as jest.Mocked<TagRepository>;

    service = new TagService(mockRepository);
  });

  describe('getById', () => {
    it('should return a mapped tag response when found', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(testTagDto);

      const result = await service.getById(testTagDto.id);

      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        undefined,
      );
      expect(result).toStrictEqual({
        id: testTagDto.id,
        ownerId: testTagDto.ownerId,
        private: testTagDto.private,
        name: testTagDto.name,
        description: testTagDto.description,
        parentId: undefined,
        createdOn: testTagDto.createdOn,
        updatedOn: testTagDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when tag is missing', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(null);

      await expect(service.getById(testTagDto.id)).rejects.toBeInstanceOf(
        CustomNotFoundError,
      );
      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        undefined,
      );
    });

    it('should throw CustomInternalError for unexpected repository failures', async () => {
      mockRepository.getTagById.mockRejectedValueOnce(new Error('failure'));

      await expect(service.getById(testTagDto.id)).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        undefined,
      );
    });
  });

  describe('getMany', () => {
    it('should return a paginated list of tags', async () => {
      mockRepository.getManyTags.mockResolvedValueOnce([testTagDto]);
      mockRepository.getTagsCount.mockResolvedValueOnce(1);

      const result = await service.getMany();

      expect(mockRepository.getManyTags).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getTagsCount).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        page: [
          {
            id: testTagDto.id,
            ownerId: testTagDto.ownerId,
            private: testTagDto.private,
            name: testTagDto.name,
            description: testTagDto.description,
            parentId: undefined,
            createdOn: testTagDto.createdOn,
            updatedOn: testTagDto.updatedOn,
          },
        ],
        total: 1,
      });
    });

    it('should throw CustomInternalError for repository failures', async () => {
      mockRepository.getManyTags.mockRejectedValueOnce(new Error('failure'));
      mockRepository.getTagsCount.mockResolvedValueOnce(0);

      await expect(service.getMany()).rejects.toBeInstanceOf(
        CustomInternalError,
      );
      expect(mockRepository.getManyTags).toHaveBeenCalledWith(undefined);
      expect(mockRepository.getTagsCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new tag when input is valid', async () => {
      const createTagDto: CreateTagDto = { name: 'New Tag' };
      mockRepository.getTagByName.mockResolvedValueOnce(null);
      mockRepository.createTag.mockResolvedValueOnce(testTagDto);

      const result = await service.create(createTagDto, '123-abc');

      expect(mockRepository.getTagByName).toHaveBeenCalledWith(
        createTagDto.name,
        '123-abc',
      );
      expect(mockRepository.createTag).toHaveBeenCalledWith(
        createTagDto,
        '123-abc',
      );
      expect(result).toStrictEqual({
        id: testTagDto.id,
        ownerId: testTagDto.ownerId,
        private: testTagDto.private,
        name: testTagDto.name,
        description: testTagDto.description,
        parentId: undefined,
        createdOn: testTagDto.createdOn,
        updatedOn: testTagDto.updatedOn,
      });
    });

    it('should create a public SYSTEM-owned tag', async () => {
      const createTagDto: CreateTagDto = { name: 'Shared Tag' };
      const systemTag = {
        ...testTagDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      };
      mockRepository.getTagByName.mockResolvedValueOnce(null);
      mockRepository.createTag.mockResolvedValueOnce(systemTag);

      await expect(service.createSystem(createTagDto)).resolves.toMatchObject({
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      });
      expect(mockRepository.createTag).toHaveBeenCalledWith(
        createTagDto,
        SYSTEM_OWNER_ID,
        false,
      );
    });

    it('should throw BadRequestException when tag name is already in use', async () => {
      const createTagDto: CreateTagDto = { name: testTagDto.name };
      mockRepository.getTagByName.mockResolvedValueOnce(testTagDto);

      await expect(
        service.create(createTagDto, '123-abc'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(mockRepository.getTagByName).toHaveBeenCalledWith(
        createTagDto.name,
        '123-abc',
      );
    });
  });

  describe('update', () => {
    it('should update an existing tag with valid input', async () => {
      const updateTagDto: UpdateTagDto = { name: 'Updated Tag' };
      const updatedTagDto: TagDto = {
        ...testTagDto,
        name: updateTagDto.name,
      };

      mockRepository.getTagById.mockResolvedValueOnce(testTagDto);
      mockRepository.getTagByName.mockResolvedValueOnce(null);
      mockRepository.updateTag.mockResolvedValueOnce(updatedTagDto);

      const result = await service.update(
        testTagDto.id,
        updateTagDto,
        writeOwnership,
      );

      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        writeOwnership,
      );
      expect(mockRepository.getTagByName).toHaveBeenCalledWith(
        updateTagDto.name,
        '123-abc',
      );
      expect(mockRepository.updateTag).toHaveBeenCalledWith(
        testTagDto.id,
        updateTagDto,
        writeOwnership,
      );
      expect(result).toStrictEqual({
        id: updatedTagDto.id,
        ownerId: updatedTagDto.ownerId,
        private: updatedTagDto.private,
        name: updatedTagDto.name,
        description: updatedTagDto.description,
        parentId: undefined,
        createdOn: updatedTagDto.createdOn,
        updatedOn: updatedTagDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when updating a missing tag', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(null);

      await expect(
        service.update(testTagDto.id, { name: 'New Name' }, writeOwnership),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        writeOwnership,
      );
    });

    it('should deny updating a SYSTEM tag without SYSTEM_COLLECTION FULL', async () => {
      mockRepository.getTagById.mockResolvedValueOnce({
        ...testTagDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      });

      await expect(
        service.update(testTagDto.id, { name: 'Updated' }, writeOwnership),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockRepository.updateTag).not.toHaveBeenCalled();
    });

    it('should update a SYSTEM tag with SYSTEM_COLLECTION FULL', async () => {
      const systemTag = {
        ...testTagDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      };
      mockRepository.getTagById.mockResolvedValueOnce(systemTag);
      mockRepository.getTagByName.mockResolvedValueOnce(null);
      mockRepository.updateTag.mockResolvedValueOnce({
        ...systemTag,
        name: 'Updated',
      });

      await service.update(
        testTagDto.id,
        { name: 'Updated' },
        { ...writeOwnership, hasSystemCollectionFullPermission: true },
      );

      expect(mockRepository.updateTag).toHaveBeenCalledWith(
        testTagDto.id,
        { name: 'Updated' },
        { userId: SYSTEM_OWNER_ID, hasCollectionSuperuserPermission: false },
      );
    });

    it('should reject update when a tag is set as its own parent', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(testTagDto);

      await expect(
        service.update(
          testTagDto.id,
          { parentId: testTagDto.id },
          writeOwnership,
        ),
      ).rejects.toThrow('Tag cannot be its own parent');

      expect(mockRepository.updateTag).not.toHaveBeenCalled();
    });

    it('should reject update when parent change would create a cycle', async () => {
      mockRepository.getTagById
        .mockResolvedValueOnce(testTagDto)
        .mockResolvedValueOnce({
          ...testTagDto,
          id: 'tag-2',
          parentId: 'tag-3',
        })
        .mockResolvedValueOnce({
          ...testTagDto,
          id: 'tag-3',
          parentId: 'tag-1',
        });

      await expect(
        service.update('tag-1', { parentId: 'tag-2' }, writeOwnership),
      ).rejects.toThrow('Tag parent relationship would create a cycle');

      expect(mockRepository.updateTag).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing tag and return its response', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(testTagDto);
      mockRepository.deleteTag.mockResolvedValueOnce(testTagDto);

      const result = await service.delete(testTagDto.id, writeOwnership);

      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        writeOwnership,
      );
      expect(mockRepository.deleteTag).toHaveBeenCalledWith(
        testTagDto.id,
        writeOwnership,
      );
      expect(result).toStrictEqual({
        id: testTagDto.id,
        ownerId: testTagDto.ownerId,
        private: testTagDto.private,
        name: testTagDto.name,
        description: testTagDto.description,
        parentId: undefined,
        createdOn: testTagDto.createdOn,
        updatedOn: testTagDto.updatedOn,
      });
    });

    it('should throw CustomNotFoundError when deleting a missing tag', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(null);

      await expect(
        service.delete(testTagDto.id, writeOwnership),
      ).rejects.toBeInstanceOf(CustomNotFoundError);
      expect(mockRepository.getTagById).toHaveBeenCalledWith(
        testTagDto.id,
        writeOwnership,
      );
    });
  });

  describe('makeSystemOwned', () => {
    it('should transfer an owned tag to SYSTEM and mark it public', async () => {
      mockRepository.getTagById.mockResolvedValueOnce(testTagDto);
      mockRepository.makeTagSystemOwned.mockResolvedValueOnce({
        ...testTagDto,
        ownerId: SYSTEM_OWNER_ID,
        private: false,
      });

      const result = await service.makeSystemOwned(testTagDto.id, {
        ...writeOwnership,
        hasSystemCollectionFullPermission: true,
      });

      expect(mockRepository.getTagById).toHaveBeenCalledWith(testTagDto.id, {
        userId: writeOwnership.userId,
        hasCollectionSuperuserPermission: false,
      });
      expect(mockRepository.makeTagSystemOwned).toHaveBeenCalledWith(
        testTagDto.id,
        {
          userId: writeOwnership.userId,
          hasCollectionSuperuserPermission: false,
        },
      );
      expect(result).toEqual(
        expect.objectContaining({
          ownerId: SYSTEM_OWNER_ID,
          private: false,
        }),
      );
    });

    it('should deny makeSystemOwned without SYSTEM_COLLECTION FULL', async () => {
      await expect(
        service.makeSystemOwned(testTagDto.id, writeOwnership),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockRepository.getTagById).not.toHaveBeenCalled();
      expect(mockRepository.makeTagSystemOwned).not.toHaveBeenCalled();
    });

    it('should deny makeSystemOwned when caller does not own the tag', async () => {
      mockRepository.getTagById.mockResolvedValueOnce({
        ...testTagDto,
        ownerId: SYSTEM_OWNER_ID,
      });

      await expect(
        service.makeSystemOwned(testTagDto.id, {
          ...writeOwnership,
          hasSystemCollectionFullPermission: true,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(mockRepository.makeTagSystemOwned).not.toHaveBeenCalled();
    });
  });
});
