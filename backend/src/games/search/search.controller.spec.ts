import { Test } from '@nestjs/testing';

import { GameDataType } from '@common/enums/GameDataType.enum';
import { SEARCH_GATEWAY } from './infrastructure/search.gateway';
import { SearchController } from './search.controller';

describe('SearchController', () => {
  it('delegates search requests to the gateway', async () => {
    const search = jest.fn().mockResolvedValue({ results: [] });

    const moduleRef = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SEARCH_GATEWAY, useValue: { search } }],
    }).compile();

    const controller = moduleRef.get(SearchController);
    await expect(
      controller.search({ types: [GameDataType.GAME] }),
    ).resolves.toEqual({ results: [] });
    expect(search).toHaveBeenCalledWith({ types: [GameDataType.GAME] });
  });
});
