import { CustomNotFoundError } from '@common/errors/service-errors';
import { PostgresGameRepository } from './game.pg-repository';
import { GameLength } from '../../../games/games/dto/in/game-length.enum';

describe('PostgresGameRepository', () => {
  let connector: any;
  let connection: any;
  let repository: PostgresGameRepository;

  beforeEach(() => {
    connection = {
      query: jest.fn(),
      release: jest.fn(),
    };

    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
      getConnection: jest.fn().mockResolvedValue(connection),
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

  it('creates a game and persists relation links in one transaction', async () => {
    const created = {
      id: 'generated-id',
      name: 'Catan',
      description: 'Trade and build',
      length: 'medium',
      tagIds: ['tag-1'],
      locations: [{ locationId: 'location-1', note: 'shelf-2' }],
      locationIds: ['location-1'],
      scoringSchemaIds: ['schema-1'],
      helperIds: ['helper-1'],
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connection.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [created] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      repository.createGame({
        name: 'Catan',
        description: 'Trade and build',
        length: GameLength.MEDIUM,
        tagIds: ['tag-1'],
        locations: [{ locationId: 'location-1', note: 'shelf-2' }],
        scoringSchemaIds: ['schema-1'],
        helperIds: ['helper-1'],
      }),
    ).resolves.toEqual(created);

    expect(connection.query).toHaveBeenCalledWith('BEGIN');
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO games'),
      expect.any(Array),
    );
    const createGameCall = connection.query.mock.calls.find((call: any[]) =>
      String(call[0]).includes('INSERT INTO games'),
    );
    const createdGameId = createGameCall?.[1]?.[0];

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_tags'),
      [createdGameId, ['tag-1']],
    );

    const createLocationsCall = connection.query.mock.calls.find(
      (call: any[]) =>
        String(call[0]).includes('INSERT INTO game_locations') &&
        call[1]?.[0] === createdGameId,
    );
    const parsedCreateLocations = JSON.parse(createLocationsCall?.[1]?.[1]);

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_locations'),
      [createdGameId, expect.any(String)],
    );
    expect(parsedCreateLocations).toEqual([
      { location_id: 'location-1', note: 'shelf-2' },
    ]);
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_scoring_schemas'),
      [createdGameId, ['schema-1']],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_helpers'),
      [createdGameId, ['helper-1']],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM games'),
      [createdGameId],
    );
    expect(connection.query).toHaveBeenCalledWith('COMMIT');
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  it('returns games from getManyGames using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'game-1' }]);

    await expect(
      repository.getManyGames({ pagination: { pageSize: 10, pageNumber: 0 } }),
    ).resolves.toEqual([{ id: 'game-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { pageSize: 10, pageNumber: 0 },
    });
  });

  it('throws CustomNotFoundError when updating a missing game', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(
      repository.updateGame('missing', { name: 'New Name' }),
    ).rejects.toBeInstanceOf(CustomNotFoundError);
  });

  it('updates game relations and location notes in one transaction', async () => {
    connector.getOne.mockResolvedValue({
      id: 'game-1',
      name: 'Old Name',
      description: null,
      length: GameLength.SHORT,
      tagIds: [],
      locations: [],
      locationIds: [],
      scoringSchemaIds: [],
      helperIds: [],
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const updated = {
      id: 'game-1',
      name: 'New Name',
      description: 'updated',
      length: GameLength.LONG,
      tagIds: ['tag-1'],
      locations: [{ locationId: 'location-1', note: 'cabinet A' }],
      locationIds: ['location-1'],
      scoringSchemaIds: ['schema-1'],
      helperIds: ['helper-1'],
      createdOn: new Date(),
      updatedOn: new Date(),
    };

    connection.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [updated] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      repository.updateGame('game-1', {
        name: 'New Name',
        description: 'updated',
        length: GameLength.LONG,
        tagIds: ['tag-1'],
        locations: [{ locationId: 'location-1', note: 'cabinet A' }],
        scoringSchemaIds: ['schema-1'],
        helperIds: ['helper-1'],
      }),
    ).resolves.toEqual(updated);

    expect(connection.query).toHaveBeenCalledWith('BEGIN');
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE games SET'),
      ['New Name', 'updated', GameLength.LONG, 'game-1'],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM game_tags'),
      ['game-1'],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_tags'),
      ['game-1', ['tag-1']],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM game_locations'),
      ['game-1'],
    );

    const updateLocationsCall = connection.query.mock.calls.find(
      (call: any[]) =>
        String(call[0]).includes('INSERT INTO game_locations') &&
        call[1]?.[0] === 'game-1',
    );
    const parsedUpdateLocations = JSON.parse(updateLocationsCall?.[1]?.[1]);

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_locations'),
      ['game-1', expect.any(String)],
    );
    expect(parsedUpdateLocations).toEqual([
      { location_id: 'location-1', note: 'cabinet A' },
    ]);
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM game_scoring_schemas'),
      ['game-1'],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_scoring_schemas'),
      ['game-1', ['schema-1']],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM game_helpers'),
      ['game-1'],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO game_helpers'),
      ['game-1', ['helper-1']],
    );
    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM games'),
      ['game-1'],
    );
    expect(connection.query).toHaveBeenCalledWith('COMMIT');
    expect(connection.release).toHaveBeenCalledTimes(1);
  });
});
