import { BadRequestException } from '@nestjs/common';

import { CustomNotFoundError } from '@common/errors/service-errors';

import { GameLength } from '../dto/in/game-length.enum';
import { GameService } from './game.service';

describe('GameService', () => {
  const repository = {
    getGameById: jest.fn(),
    getGameByName: jest.fn(),
    getManyGames: jest.fn(),
    getAllGamesCount: jest.fn(),
    createGame: jest.fn(),
    updateGame: jest.fn(),
    deleteGame: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws not found for missing game', async () => {
    repository.getGameById.mockResolvedValue(null);
    const service = new GameService(repository);

    await expect(service.getById('missing')).rejects.toBeInstanceOf(
      CustomNotFoundError,
    );
  });

  it('rejects duplicate game names on create', async () => {
    repository.getGameByName.mockResolvedValue({ id: 'existing' });
    const service = new GameService(repository);

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
      locationIds: ['location-1'],
      scoringSchemaIds: ['schema-1'],
      helperIds: ['helper-1'],
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      updatedOn: new Date('2026-01-02T00:00:00.000Z'),
    });
    const service = new GameService(repository);

    await expect(service.getById('game-1')).resolves.toEqual({
      id: 'game-1',
      name: 'Terraforming Mars',
      description: undefined,
      length: GameLength.LONG,
      tags: ['tag-1'],
      locations: ['location-1'],
      scoringSchemas: ['schema-1'],
      helpers: ['helper-1'],
      createdOn: new Date('2026-01-01T00:00:00.000Z'),
      updatedOn: new Date('2026-01-02T00:00:00.000Z'),
    });
  });
});
