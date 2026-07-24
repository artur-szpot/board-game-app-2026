import { Test } from '@nestjs/testing';

import { GAME_REPOSITORY } from '@db/repositories/game.repository';
import { LOCATION_REPOSITORY } from '@db/repositories/location.repository';
import { TAG_REPOSITORY } from '@db/repositories/tag.repository';

import { SearchService } from './search.service';
import { GameDataType } from '@common/enums/GameDataType.enum';

describe('SearchService', () => {
  it('returns combined short results for requested types', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: GAME_REPOSITORY,
          useValue: {
            getManyGames: jest
              .fn()
              .mockResolvedValue([{ id: 'g1', name: 'Game 1' }]),
          },
        },
        {
          provide: TAG_REPOSITORY,
          useValue: {
            getManyTags: jest
              .fn()
              .mockResolvedValue([{ id: 't1', name: 'Tag 1' }]),
          },
        },
        {
          provide: LOCATION_REPOSITORY,
          useValue: {
            getManyLocations: jest
              .fn()
              .mockResolvedValue([{ id: 'l1', name: 'Location 1' }]),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(SearchService);
    await expect(
      service.search({
        types: [GameDataType.GAME, GameDataType.TAG, GameDataType.LOCATION],
        pagination: { pageSize: 10, pageNumber: 0 },
      }),
    ).resolves.toEqual({
      results: [
        { type: GameDataType.GAME, id: 'g1', name: 'Game 1' },
        { type: GameDataType.TAG, id: 't1', name: 'Tag 1' },
        { type: GameDataType.LOCATION, id: 'l1', name: 'Location 1' },
      ],
    });
  });
});
