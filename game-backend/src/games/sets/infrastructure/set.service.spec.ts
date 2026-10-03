import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { SYSTEM_OWNER_ID } from '@common/constants/system-owner';
import { CustomNotFoundError } from '@common/errors/service-errors';

import { SetService } from './set.service';

describe('SetService', () => {
  const repository = {
    getSetById: jest.fn(),
    getSetsByIds: jest.fn(),
    getSetByName: jest.fn(),
    getManySets: jest.fn(),
    getSetsCount: jest.fn(),
    countReferencingHelpers: jest.fn(),
    createSet: jest.fn(),
    updateSet: jest.fn(),
    deleteSet: jest.fn(),
  };
  const service = new SetService(repository);
  const data = {
    properties: ['category'],
    items: [{ name: 'card1', properties: { category: '' } }],
  };
  const set = {
    id: 'set-1',
    ownerId: 'user-1',
    private: true,
    name: 'cards',
    data,
    createdOn: '2026-01-01',
    updatedOn: '2026-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid set data before touching the database', async () => {
    await expect(
      service.create(
        { name: 'cards', data: { items: [{ value: 'x' }] } },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createSet).not.toHaveBeenCalled();
  });

  it('creates sets owned by the caller', async () => {
    repository.getSetByName.mockResolvedValue(null);
    repository.createSet.mockResolvedValue(set);

    await expect(
      service.create({ name: 'cards', data }, 'user-1'),
    ).resolves.toEqual(set);
    expect(repository.createSet).toHaveBeenCalledWith(
      { name: 'cards', data },
      'user-1',
    );
  });

  it('throws not found for missing sets', async () => {
    repository.getSetById.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toBeInstanceOf(
      CustomNotFoundError,
    );
  });

  it('refuses to delete sets referenced by helpers', async () => {
    repository.getSetById.mockResolvedValue(set);
    repository.countReferencingHelpers.mockResolvedValue(2);

    await expect(service.delete('set-1', { userId: 'user-1' })).rejects.toThrow(
      'Set is used by 2 helper(s) and cannot be deleted',
    );
    expect(repository.deleteSet).not.toHaveBeenCalled();
  });

  it('deletes unreferenced sets', async () => {
    repository.getSetById.mockResolvedValue(set);
    repository.countReferencingHelpers.mockResolvedValue(0);
    repository.deleteSet.mockResolvedValue(set);

    await service.delete('set-1', { userId: 'user-1' });
    expect(repository.deleteSet).toHaveBeenCalledWith('set-1', {
      userId: 'user-1',
      hasCollectionSuperuserPermission: false,
    });
  });

  it('requires SYSTEM_COLLECTION FULL to update SYSTEM sets', async () => {
    repository.getSetById.mockResolvedValue({
      ...set,
      ownerId: SYSTEM_OWNER_ID,
    });

    await expect(
      service.update('set-1', { name: 'newName' }, { userId: 'user-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it.each(['Cards', '', 'new name', 'card-name'])(
    'rejects invalid set name %s for every write path',
    async (name) => {
      await expect(
        service.create({ name, data }, 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.createSystem({ name, data })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(
        service.update('set-1', { name }, { userId: 'user-1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.createSet).not.toHaveBeenCalled();
      expect(repository.updateSet).not.toHaveBeenCalled();
    },
  );

  it('updates set data without changing names or ownership', async () => {
    repository.getSetById.mockResolvedValue(set);
    repository.updateSet.mockResolvedValue(set);
    await expect(
      service.update('set-1', { data }, { userId: 'user-1' }),
    ).resolves.toEqual(set);
    expect(repository.updateSet).toHaveBeenCalledWith(
      'set-1',
      { data },
      {
        userId: 'user-1',
        hasCollectionSuperuserPermission: false,
      },
    );
  });
});
