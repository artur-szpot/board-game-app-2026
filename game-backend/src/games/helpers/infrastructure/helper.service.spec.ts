import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import { CustomNotFoundError } from '@common/errors/service-errors';

import { HelperService } from './helper.service';

describe('HelperService', () => {
  const repository = {
    getHelperById: jest.fn(),
    getHelpersByIds: jest.fn(),
    getHelperByName: jest.fn(),
    getManyHelpers: jest.fn(),
    getHelpersCount: jest.fn(),
    createHelper: jest.fn(),
    updateHelper: jest.fn(),
    deleteHelper: jest.fn(),
  };

  const service = new HelperService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws not found when helper is missing', async () => {
    repository.getHelperById.mockResolvedValue(null);

    await expect(service.getById('missing')).rejects.toBeInstanceOf(
      CustomNotFoundError,
    );
  });

  it('rejects duplicate helper names on create', async () => {
    repository.getHelperByName.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({ name: 'Helper', logic: {} }, 'user-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps created helper responses', async () => {
    repository.getHelperByName.mockResolvedValue(null);
    repository.createHelper.mockResolvedValue({
      id: '1',
      ownerId: 'user-1',
      private: true,
      name: 'Helper',
      logic: { a: 1 },
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    });

    await expect(
      service.create({ name: 'Helper', logic: { a: 1 } }, 'user-1'),
    ).resolves.toEqual({
      id: '1',
      ownerId: 'user-1',
      private: true,
      name: 'Helper',
      logic: { a: 1 },
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    });
  });

  it('creates public SYSTEM-owned helpers', async () => {
    const input = { name: 'Shared Helper', logic: { a: 1 } };
    repository.getHelperByName.mockResolvedValue(null);
    repository.createHelper.mockResolvedValue({
      id: 'system-helper',
      ownerId: SYSTEM_OWNER_ID,
      private: false,
      ...input,
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    });

    await service.createSystem(input);

    expect(repository.createHelper).toHaveBeenCalledWith(
      input,
      SYSTEM_OWNER_ID,
      false,
    );
  });

  it('denies deleting SYSTEM helpers without SYSTEM_COLLECTION FULL', async () => {
    repository.getHelperById.mockResolvedValue({
      id: 'system-helper',
      ownerId: SYSTEM_OWNER_ID,
      private: false,
      name: 'Shared Helper',
      logic: {},
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    });

    await expect(
      service.delete('system-helper', { userId: 'user-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.deleteHelper).not.toHaveBeenCalled();
  });

  it('deletes SYSTEM helpers with SYSTEM_COLLECTION FULL', async () => {
    const systemHelper = {
      id: 'system-helper',
      ownerId: SYSTEM_OWNER_ID,
      private: false,
      name: 'Shared Helper',
      logic: {},
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    };
    repository.getHelperById.mockResolvedValue(systemHelper);
    repository.deleteHelper.mockResolvedValue(systemHelper);

    await service.delete('system-helper', {
      userId: 'user-1',
      hasSystemCollectionFullPermission: true,
    });

    expect(repository.deleteHelper).toHaveBeenCalledWith('system-helper', {
      userId: SYSTEM_OWNER_ID,
      hasCollectionSuperuserPermission: false,
    });
  });
});
