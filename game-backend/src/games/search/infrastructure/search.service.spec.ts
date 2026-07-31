import { Test } from '@nestjs/testing';

import { GAME_GATEWAY } from '../../games/infrastructure/game.gateway';
import { HELPER_GATEWAY } from '../../helpers/infrastructure/helper.gateway';
import { LOCATION_GATEWAY } from '../../locations/infrastructure/location.gateway';
import { SCORING_SCHEMA_GATEWAY } from '../../scoring-schemas/infrastructure/scoring-schema.gateway';
import { TAG_GATEWAY } from '../../tags/infrastructure/tag.gateway';

import { SearchService } from './search.service';
import { GameDataType } from '@common/enums/GameDataType.enum';

describe('SearchService', () => {
  it('returns combined short results for requested types', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: GAME_GATEWAY,
          useValue: {
            getMany: jest.fn().mockResolvedValue({ page: [{ id: 'g1', name: 'Game 1' }], total: 1 }),
          },
        },
        {
          provide: TAG_GATEWAY,
          useValue: {
            getMany: jest.fn().mockResolvedValue({ page: [{ id: 't1', name: 'Tag 1' }], total: 1 }),
          },
        },
        {
          provide: LOCATION_GATEWAY,
          useValue: {
            getMany: jest.fn().mockResolvedValue({ page: [{ id: 'l1', name: 'Location 1' }], total: 1 }),
          },
        },
        {
          provide: HELPER_GATEWAY,
          useValue: {
            getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }),
          },
        },
        {
          provide: SCORING_SCHEMA_GATEWAY,
          useValue: {
            getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }),
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
      total: 3,
    });
  });

  it('paginates globally across requested data types in request order', async () => {
    const gameGateway = {
      getMany: jest.fn().mockResolvedValue({
        page: [{ id: 'g4', name: 'Game 4' }, { id: 'g5', name: 'Game 5' }],
        total: 5,
      }),
    };
    const tagGateway = {
      getMany: jest.fn().mockResolvedValue({ page: [{ id: 't1', name: 'Tag 1' }], total: 4 }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: GAME_GATEWAY, useValue: gameGateway },
        { provide: TAG_GATEWAY, useValue: tagGateway },
        {
          provide: LOCATION_GATEWAY,
          useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) },
        },
        {
          provide: HELPER_GATEWAY,
          useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) },
        },
        {
          provide: SCORING_SCHEMA_GATEWAY,
          useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) },
        },
      ],
    }).compile();

    const service = moduleRef.get(SearchService);
    await expect(
      service.search({
        types: [GameDataType.GAME, GameDataType.TAG],
        pagination: { pageSize: 3, pageNumber: 1 },
        sort: { name: 'desc' },
      }),
    ).resolves.toEqual({
      results: [
        { type: GameDataType.GAME, id: 'g4', name: 'Game 4' },
        { type: GameDataType.GAME, id: 'g5', name: 'Game 5' },
        { type: GameDataType.TAG, id: 't1', name: 'Tag 1' },
      ],
      total: 9,
    });

    expect(gameGateway.getMany).toHaveBeenCalledWith({
      searchTerm: undefined,
      filters: undefined,
      sort: { name: 'desc' },
      includeDetail: undefined,
      pagination: { pageNumber: 0, pageSize: 2, offset: 3 },
    });
    expect(tagGateway.getMany).toHaveBeenCalledWith({
      searchTerm: undefined,
      filters: undefined,
      sort: { name: 'desc' },
      includeDetail: undefined,
      pagination: { pageNumber: 0, pageSize: 1, offset: 0 },
    });
  });

  it('includes full detail when requested', async () => {
    const game = {
      id: 'g1',
      name: 'Game 1',
      description: 'Desc',
      length: 'short',
      minPlayers: 2,
      maxPlayers: 4,
      tags: [],
      locations: [],
      locationIds: [],
      scoringSchemaIds: [],
      helperIds: [],
      createdOn: '2026-07-24T00:00:00.000Z',
      updatedOn: '2026-07-24T00:00:00.000Z',
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: GAME_GATEWAY,
          useValue: {
            getMany: jest.fn().mockResolvedValue({ page: [game], total: 1 }),
          },
        },
        { provide: TAG_GATEWAY, useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) } },
        { provide: LOCATION_GATEWAY, useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) } },
        { provide: HELPER_GATEWAY, useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) } },
        { provide: SCORING_SCHEMA_GATEWAY, useValue: { getMany: jest.fn().mockResolvedValue({ page: [], total: 0 }) } },
      ],
    }).compile();

    const service = moduleRef.get(SearchService);
    await expect(
      service.search({ types: [GameDataType.GAME], includeDetail: true }),
    ).resolves.toEqual({
      results: [
        { type: GameDataType.GAME, id: 'g1', name: 'Game 1', detail: game },
      ],
      total: 1,
    });
  });
});
