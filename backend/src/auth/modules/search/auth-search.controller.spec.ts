import { Test } from '@nestjs/testing';

import { AdminDataType } from './enums/AdminDataType.enum';
import { AuthSearchController } from './auth-search.controller';
import { AUTH_SEARCH_GATEWAY } from './infrastructure/auth-search.gateway';

describe('AuthSearchController', () => {
  it('delegates search requests to the gateway', async () => {
    const search = jest.fn().mockResolvedValue({ results: [], total: 0 });

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthSearchController],
      providers: [{ provide: AUTH_SEARCH_GATEWAY, useValue: { search } }],
    }).compile();

    const controller = moduleRef.get(AuthSearchController);
    await expect(
      controller.search({ types: [AdminDataType.USER] }),
    ).resolves.toEqual({ results: [], total: 0 });
    expect(search).toHaveBeenCalledWith({ types: [AdminDataType.USER] });
  });
});
