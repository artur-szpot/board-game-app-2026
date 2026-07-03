import { BadRequestException } from '@nestjs/common';

import { CustomNotFoundError } from '@common/errors/service-errors';

import { HelperService } from './helper.service';

describe('HelperService', () => {
  const repository = {
    getHelperById: jest.fn(),
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

    await expect(service.getById('missing')).rejects.toBeInstanceOf(CustomNotFoundError);
  });

  it('rejects duplicate helper names on create', async () => {
    repository.getHelperByName.mockResolvedValue({ id: 'existing' });

    await expect(service.create({ name: 'Helper', logic: {} })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps created helper responses', async () => {
    repository.getHelperByName.mockResolvedValue(null);
    repository.createHelper.mockResolvedValue({
      id: '1',
      name: 'Helper',
      logic: { a: 1 },
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    });

    await expect(service.create({ name: 'Helper', logic: { a: 1 } })).resolves.toEqual({
      id: '1',
      name: 'Helper',
      logic: { a: 1 },
      createdOn: '2024-01-01',
      updatedOn: '2024-01-01',
    });
  });
});
