import { Test } from '@nestjs/testing';

import { GAME_REPOSITORY } from '@db/repositories/game.repository';
import { LOCATION_REPOSITORY } from '@db/repositories/location.repository';
import { TAG_REPOSITORY } from '@db/repositories/tag.repository';

import { SearchService } from './search.service';

describe('SearchService', () => {
  it('returns combined short results for requested types', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: GAME_REPOSITORY, useValue: { getManyGames: jest.fn().mockResolvedValue([{ id: 'g1', name: 'Game 1' }]) } },
        { provide: TAG_REPOSITORY, useValue: { getManyTags: jest.fn().mockResolvedValue([{ id: 't1', name: 'Tag 1' }]) } },
        { provide: LOCATION_REPOSITORY, useValue: { getManyLocations: jest.fn().mockResolvedValue([{ id: 'l1', name: 'Location 1' }]) } },
      ],
    }).compile();

    const service = moduleRef.get(SearchService);
    await expect(service.search({ types: ['game', 'tag', 'location'], pagination: { pageSize: 10, pageNumber: 0 } })).resolves.toEqual({
      results: [
        { type: 'game', id: 'g1', name: 'Game 1' },
        { type: 'tag', id: 't1', name: 'Tag 1' },
        { type: 'location', id: 'l1', name: 'Location 1' },
      ],
    });
  });
});
