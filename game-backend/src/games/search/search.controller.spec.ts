import { Test } from '@nestjs/testing';

import { GameDataType } from '@common/enums/GameDataType.enum';
import { SEARCH_GATEWAY } from './infrastructure/search.gateway';
import { SearchController } from './search.controller';

describe('SearchController', () => {
  it('delegates search requests to the gateway', async () => {
    const search = jest.fn().mockResolvedValue({ results: [], total: 0 });

    const moduleRef = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SEARCH_GATEWAY, useValue: { search } }],
    }).compile();

    const controller = moduleRef.get(SearchController);
    await expect(
      controller.search({ types: [GameDataType.GAME] }, 'user-1', {
        user: { permissions: [] },
      } as never),
    ).resolves.toEqual({ results: [], total: 0 });
    expect(search).toHaveBeenCalledWith(
      { types: [GameDataType.GAME] },
      'user-1',
      false,
    );
  });
});
