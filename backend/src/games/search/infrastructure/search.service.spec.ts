import { Test } from '@nestjs/testing';

import { GAME_REPOSITORY } from '@db/repositories/game.repository';
import { HELPER_REPOSITORY } from '@db/repositories/helper.repository';
import { LOCATION_REPOSITORY } from '@db/repositories/location.repository';
import { SCORING_SCHEMA_REPOSITORY } from '@db/repositories/scoring-schema.repository';
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
            getGamesCount: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: TAG_REPOSITORY,
          useValue: {
            getManyTags: jest
              .fn()
              .mockResolvedValue([{ id: 't1', name: 'Tag 1' }]),
            getTagsCount: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: LOCATION_REPOSITORY,
          useValue: {
            getManyLocations: jest
              .fn()
              .mockResolvedValue([{ id: 'l1', name: 'Location 1' }]),
            getLocationsCount: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: HELPER_REPOSITORY,
          useValue: {
            getManyHelpers: jest.fn().mockResolvedValue([]),
            getHelpersCount: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: SCORING_SCHEMA_REPOSITORY,
          useValue: {
            getManyScoringSchemas: jest.fn().mockResolvedValue([]),
            getScoringSchemasCount: jest.fn().mockResolvedValue(0),
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
    const gameRepository = {
      getManyGames: jest
        .fn()
        .mockResolvedValue([
          { id: 'g4', name: 'Game 4' },
          { id: 'g5', name: 'Game 5' },
        ]),
      getGamesCount: jest.fn().mockResolvedValue(5),
    };
    const tagRepository = {
      getManyTags: jest.fn().mockResolvedValue([{ id: 't1', name: 'Tag 1' }]),
      getTagsCount: jest.fn().mockResolvedValue(4),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: GAME_REPOSITORY, useValue: gameRepository },
        { provide: TAG_REPOSITORY, useValue: tagRepository },
        {
          provide: LOCATION_REPOSITORY,
          useValue: { getManyLocations: jest.fn(), getLocationsCount: jest.fn().mockResolvedValue(0) },
        },
        {
          provide: HELPER_REPOSITORY,
          useValue: { getManyHelpers: jest.fn(), getHelpersCount: jest.fn().mockResolvedValue(0) },
        },
        {
          provide: SCORING_SCHEMA_REPOSITORY,
          useValue: {
            getManyScoringSchemas: jest.fn(),
            getScoringSchemasCount: jest.fn().mockResolvedValue(0),
          },
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

    expect(gameRepository.getManyGames).toHaveBeenCalledWith({
      searchTerm: undefined,
      filters: undefined,
      sort: { name: 'desc' },
      includeDetail: undefined,
      pagination: { pageNumber: 0, pageSize: 2, offset: 3 },
    });
    expect(tagRepository.getManyTags).toHaveBeenCalledWith({
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
      tagIds: [],
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
          provide: GAME_REPOSITORY,
          useValue: {
            getManyGames: jest.fn().mockResolvedValue([game]),
            getGamesCount: jest.fn().mockResolvedValue(1),
          },
        },
        { provide: TAG_REPOSITORY, useValue: { getManyTags: jest.fn(), getTagsCount: jest.fn().mockResolvedValue(0) } },
        { provide: LOCATION_REPOSITORY, useValue: { getManyLocations: jest.fn(), getLocationsCount: jest.fn().mockResolvedValue(0) } },
        { provide: HELPER_REPOSITORY, useValue: { getManyHelpers: jest.fn(), getHelpersCount: jest.fn().mockResolvedValue(0) } },
        { provide: SCORING_SCHEMA_REPOSITORY, useValue: { getManyScoringSchemas: jest.fn(), getScoringSchemasCount: jest.fn().mockResolvedValue(0) } },
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
