import { CustomNotFoundError } from '@common/errors/service-errors';
import { PostgresGameRepository } from './game.pg-repository';
import { GameLength } from '../../../games/games/dto/in/game-length.enum';

describe('PostgresGameRepository', () => {
  let connector: any;
  let repository: PostgresGameRepository;

  beforeEach(() => {
    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
    };
    repository = new PostgresGameRepository(connector);
  });

  it('returns null when a game is missing', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(repository.getGameById('missing')).resolves.toBeNull();
    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('FROM games'),
      ['missing'],
    );
  });

  it('creates a game using the connector', async () => {
    const created = {
      id: 'game-1',
      name: 'Catan',
      description: 'Trade and build',
      length: 'medium',
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connector.getOne.mockResolvedValue(created);

    await expect(
      repository.createGame({
        name: 'Catan',
        description: 'Trade and build',
        length: GameLength.MEDIUM,
      }),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO games'),
      expect.any(Array),
    );
  });

  it('returns games from getManyGames using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'game-1' }]);

    await expect(
      repository.getManyGames({ pagination: { pageSize: 10, pageNumber: 0 } }),
    ).resolves.toEqual([{ id: 'game-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { take: 10, skip: 0 },
    });
  });

  it('throws CustomNotFoundError when updating a missing game', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(
      repository.updateGame('missing', { name: 'New Name' }),
    ).rejects.toBeInstanceOf(CustomNotFoundError);
  });
});
