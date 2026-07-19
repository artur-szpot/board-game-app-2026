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
      service.create({
        name: 'Duplicate',
        length: GameLength.SHORT,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps linking-table ids into response collections', async () => {
    repository.getGameById.mockResolvedValue({
      id: 'game-1',
      name: 'Terraforming Mars',
      description: null,
      length: GameLength.LONG,
      tagIds: ['tag-1'],
      locations: [{ locationId: 'location-1', note: 'top shelf' }],
      locationIds: ['location-1'],
      scoringSchemaIds: ['schema-1'],
      helperIds: ['helper-1'],
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
      name: 'Terraforming Mars',
      description: null,
      length: GameLength.LONG,
      tagIds: ['tag-1'],
      locations: [{ locationId: 'location-1', note: 'top shelf' }],
      locationIds: ['location-1'],
      scoringSchemaIds: ['schema-1'],
      helperIds: ['helper-1'],
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      updatedOn: new Date('2026-01-02T00:00:00.000Z'),
    });
  });
});
