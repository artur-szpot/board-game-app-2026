import { BadRequestException } from '@nestjs/common';

import { CustomNotFoundError } from '@common/errors/service-errors';

import { GameLength } from '../dto/in/game-length.enum';
import { GameService } from './game.service';

describe('GameService', () => {
  const repository = {
    getGameById: jest.fn(),
    getGameByName: jest.fn(),
    getManyGames: jest.fn(),
    getGamesCount: jest.fn(),
    createGame: jest.fn(),
    updateGame: jest.fn(),
    deleteGame: jest.fn(),
  };
  const tagGateway = jest.requireMock('../../tags/infrastructure/tag.gateway');
  const locationGateway = jest.requireMock(
    '../../locations/infrastructure/location.gateway',
  );
  const scoringSchemaGateway = jest.requireMock(
    '../../scoring-schemas/infrastructure/scoring-schema.gateway',
  );
  const helperGateway = jest.requireMock(
    '../../helpers/infrastructure/helper.gateway',
  );

  beforeEach(() => {
    repository.getGameById.mockReset();
    repository.getGameByName.mockReset();
    repository.getManyGames.mockReset();
    repository.getGamesCount.mockReset();
    repository.createGame.mockReset();
    repository.updateGame.mockReset();
    repository.deleteGame.mockReset();

    tagGateway.getById = jest.fn().mockResolvedValue(null);
    tagGateway.getByIds = jest.fn().mockResolvedValue([]);
    tagGateway.getMany = jest.fn().mockResolvedValue({ page: [], total: 0 });
    tagGateway.create = jest.fn().mockResolvedValue(null);
    tagGateway.update = jest.fn().mockResolvedValue(null);
    tagGateway.delete = jest.fn().mockResolvedValue(null);
    locationGateway.getById = jest.fn().mockResolvedValue(null);
    locationGateway.getByIds = jest.fn().mockResolvedValue([]);
    locationGateway.getMany = jest
      .fn()
      .mockResolvedValue({ page: [], total: 0 });
    locationGateway.create = jest.fn().mockResolvedValue(null);
    locationGateway.update = jest.fn().mockResolvedValue(null);
    locationGateway.delete = jest.fn().mockResolvedValue(null);
    scoringSchemaGateway.getById = jest.fn().mockResolvedValue(null);
    scoringSchemaGateway.getByIds = jest.fn().mockResolvedValue([]);
    scoringSchemaGateway.getMany = jest
      .fn()
      .mockResolvedValue({ page: [], total: 0 });
    scoringSchemaGateway.create = jest.fn().mockResolvedValue(null);
    scoringSchemaGateway.update = jest.fn().mockResolvedValue(null);
    scoringSchemaGateway.delete = jest.fn().mockResolvedValue(null);
    helperGateway.getById = jest.fn().mockResolvedValue(null);
    helperGateway.getByIds = jest.fn().mockResolvedValue([]);
    helperGateway.getMany = jest.fn().mockResolvedValue({ page: [], total: 0 });
    helperGateway.create = jest.fn().mockResolvedValue(null);
    helperGateway.update = jest.fn().mockResolvedValue(null);
    helperGateway.delete = jest.fn().mockResolvedValue(null);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws not found for missing game', async () => {
    repository.getGameById.mockResolvedValue(null);
    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(service.getById('missing')).rejects.toBeInstanceOf(
      CustomNotFoundError,
    );
  });

  it('rejects duplicate game names on create', async () => {
    repository.getGameByName.mockResolvedValue({ id: 'existing' });
    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.create(
        {
          name: 'Duplicate',
          length: GameLength.SHORT,
          minPlayers: 2,
          maxPlayers: 4,
        },
        '123-abc',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects non-positive player counts on create', async () => {
    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.create(
        {
          name: 'Invalid',
          length: GameLength.SHORT,
          minPlayers: 0,
          maxPlayers: 4,
        },
        '123-abc',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.createGame).not.toHaveBeenCalled();
  });

  it('rejects maxPlayers lower than minPlayers on create', async () => {
    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.create(
        {
          name: 'Invalid',
          length: GameLength.SHORT,
          minPlayers: 4,
          maxPlayers: 3,
        },
        '123-abc',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.createGame).not.toHaveBeenCalled();
  });

  it('rejects maxPlayers lower than the existing minPlayers on update', async () => {
    repository.getGameById.mockResolvedValue({
      id: 'game-1',
      ownerId: '123-abc',
      private: true,
      name: 'Terraforming Mars',
      description: null,
      length: GameLength.LONG,
      minPlayers: 2,
      maxPlayers: 5,
      tagIds: [],
      locations: [],
      scoringSchemaIds: [],
      helperIds: [],
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      updatedOn: new Date('2026-01-02T00:00:00.000Z'),
    });

    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.update(
        'game-1',
        {
          maxPlayers: 1,
        },
        { userId: '123-abc', hasCollectionSuperuserPermission: false },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.updateGame).not.toHaveBeenCalled();
  });

  it('rejects create when game-as-location ID does not exist with an informative 400', async () => {
    repository.getGameById.mockImplementation(async (id: string) => {
      if (id === 'missing-game') {
        return null;
      }
      return null;
    });

    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.create(
        {
          name: 'Base + Expansion',
          length: GameLength.MEDIUM,
          minPlayers: 2,
          maxPlayers: 4,
          locations: [{ locationId: 'missing-game', isGameId: true }],
        },
        '123-abc',
      ),
    ).rejects.toThrow('Game with ID "missing-game" not found');

    expect(repository.createGame).not.toHaveBeenCalled();
  });

  it('rejects update when game references itself as a location', async () => {
    repository.getGameById.mockImplementation(async (id: string) => {
      if (id === 'game-1') {
        return {
          id: 'game-1',
          ownerId: '123-abc',
          private: true,
          name: 'Root Game',
          description: null,
          length: GameLength.MEDIUM,
          minPlayers: 2,
          maxPlayers: 4,
          tagIds: [],
          locations: [],
          scoringSchemaIds: [],
          helperIds: [],
          createdOn: new Date('2026-01-01T00:00:00.000Z'),
          updatedOn: new Date('2026-01-02T00:00:00.000Z'),
        };
      }
      return null;
    });

    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.update(
        'game-1',
        {
          locations: [{ locationId: 'game-1', isGameId: true }],
        },
        { userId: '123-abc', hasCollectionSuperuserPermission: false },
      ),
    ).rejects.toThrow('Game cannot reference itself as a location');

    expect(repository.updateGame).not.toHaveBeenCalled();
  });

  it('rejects update when game-as-location link would create a cycle', async () => {
    repository.getGameById.mockImplementation(async (id: string) => {
      if (id === 'game-1') {
        return {
          id: 'game-1',
          ownerId: '123-abc',
          private: true,
          name: 'Root Game',
          description: null,
          length: GameLength.MEDIUM,
          minPlayers: 2,
          maxPlayers: 4,
          tagIds: [],
          locations: [],
          scoringSchemaIds: [],
          helperIds: [],
          createdOn: new Date('2026-01-01T00:00:00.000Z'),
          updatedOn: new Date('2026-01-02T00:00:00.000Z'),
        };
      }

      if (id === 'game-2') {
        return {
          id: 'game-2',
          ownerId: '123-abc',
          private: true,
          name: 'Child Game',
          description: null,
          length: GameLength.SHORT,
          minPlayers: 1,
          maxPlayers: 2,
          tagIds: [],
          locations: [{ locationId: 'game-1', isGameId: true }],
          scoringSchemaIds: [],
          helperIds: [],
          createdOn: new Date('2026-01-01T00:00:00.000Z'),
          updatedOn: new Date('2026-01-02T00:00:00.000Z'),
        };
      }

      return null;
    });

    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(
      service.update(
        'game-1',
        {
          locations: [{ locationId: 'game-2', isGameId: true }],
        },
        { userId: '123-abc', hasCollectionSuperuserPermission: false },
      ),
    ).rejects.toThrow(
      'Game location relationship would create a cycle via game ID "game-2"',
    );

    expect(repository.updateGame).not.toHaveBeenCalled();
  });

  it('maps linking-table ids into response collections', async () => {
    tagGateway.getByIds = jest
      .fn()
      .mockResolvedValue([
        { id: 'tag-1', name: 'Tag 1', description: undefined },
      ]);
    locationGateway.getByIds = jest.fn().mockResolvedValue([
      {
        id: 'location-1',
        path: [{ name: 'Test Location', id: 'location-1' }],
      },
    ]);
    scoringSchemaGateway.getByIds = jest.fn().mockResolvedValue([
      {
        id: 'schema-1',
        ownerId: '123-abc',
        private: true,
        name: 'Schema 1',
        description: 'Schema description',
        schema: {},
        createdOn: '2026-01-01T00:00:00.000Z',
        updatedOn: '2026-01-02T00:00:00.000Z',
      },
    ]);
    helperGateway.getByIds = jest.fn().mockResolvedValue([
      {
        id: 'helper-1',
        ownerId: '123-abc',
        private: true,
        name: 'Helper 1',
        logic: {},
        createdOn: '2026-01-01T00:00:00.000Z',
        updatedOn: '2026-01-02T00:00:00.000Z',
      },
    ]);
    repository.getGameById.mockResolvedValue({
      id: 'game-1',
      ownerId: '123-abc',
      private: true,
      name: 'Terraforming Mars',
      description: null,
      length: GameLength.LONG,
      minPlayers: 2,
      maxPlayers: 5,
      tagIds: ['tag-1'],
      locations: [
        { locationId: 'location-1', note: 'top shelf', isGameId: false },
        { locationId: 'game-2', note: 'stored with base game', isGameId: true },
      ],
      scoringSchemaIds: ['schema-1'],
      scoringSchemas: [
        {
          id: 'schema-1',
          ownerId: '123-abc',
          private: true,
          name: 'Schema 1',
          description: 'Schema description',
          schema: {},
          createdOn: '2026-01-01T00:00:00.000Z',
          updatedOn: '2026-01-02T00:00:00.000Z',
        },
      ],
      helperIds: ['helper-1'],
      helpers: [
        {
          id: 'helper-1',
          ownerId: '123-abc',
          private: true,
          name: 'Helper 1',
          logic: {},
          createdOn: '2026-01-01T00:00:00.000Z',
          updatedOn: '2026-01-02T00:00:00.000Z',
        },
      ],
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      updatedOn: new Date('2026-01-02T00:00:00.000Z'),
    });
    const service = new GameService(
      repository,
      tagGateway,
      locationGateway,
      scoringSchemaGateway,
      helperGateway,
    );

    await expect(service.getById('game-1')).resolves.toEqual({
      id: 'game-1',
      ownerId: '123-abc',
      private: true,
      name: 'Terraforming Mars',
      description: null,
      length: GameLength.LONG,
      minPlayers: 2,
      maxPlayers: 5,
      tags: [{ id: 'tag-1', name: 'Tag 1', description: undefined }],
      locations: [
        {
          locationId: 'location-1',
          note: 'top shelf',
          isGameId: false,
          path: [{ name: 'Test Location', id: 'location-1' }],
        },
        {
          locationId: 'game-2',
          note: 'stored with base game',
          isGameId: true,
          path: [],
        },
      ],
      scoringSchemaIds: ['schema-1'],
      scoringSchemas: [
        {
          id: 'schema-1',
          ownerId: '123-abc',
          private: true,
          name: 'Schema 1',
          description: 'Schema description',
          schema: {},
          createdOn: '2026-01-01T00:00:00.000Z',
          updatedOn: '2026-01-02T00:00:00.000Z',
        },
      ],
      helperIds: ['helper-1'],
      helpers: [
        {
          id: 'helper-1',
          ownerId: '123-abc',
          private: true,
          name: 'Helper 1',
          logic: {},
          createdOn: '2026-01-01T00:00:00.000Z',
          updatedOn: '2026-01-02T00:00:00.000Z',
        },
      ],
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      updatedOn: new Date('2026-01-02T00:00:00.000Z'),
    });
    expect(locationGateway.getByIds).toHaveBeenCalledWith(['location-1'], {
      userId: '123-abc',
      hasCollectionSuperuserPermission: false,
    });
    expect(scoringSchemaGateway.getByIds).toHaveBeenCalledWith(['schema-1'], {
      userId: '123-abc',
      hasCollectionSuperuserPermission: false,
    });
    expect(helperGateway.getByIds).toHaveBeenCalledWith(['helper-1'], {
      userId: '123-abc',
      hasCollectionSuperuserPermission: false,
    });
  });
});
