import { PostgresLocationRepository } from './location.pg-repository';

describe('PostgresLocationRepository', () => {
  let connector: any;
  let repository: PostgresLocationRepository;

  beforeEach(() => {
    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
    };
    repository = new PostgresLocationRepository(connector);
  });

  it('returns null when a location is missing', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(repository.getLocationById('missing')).resolves.toBeNull();
    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('FROM locations'),
      ['missing'],
    );
  });

  it('returns an empty list when no location ids are provided', async () => {
    await expect(repository.getLocationsByIds([])).resolves.toEqual([]);
    expect(connector.getMany).not.toHaveBeenCalled();
  });

  it('creates a location via the connector and includes a generated id', async () => {
    const createdLocation = {
      id: 'location-1',
      name: 'Test location',
      description: 'A description',
      parentId: null,
      isGameId: true,
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connector.getOne.mockResolvedValue(createdLocation);

    await expect(
      repository.createLocation({
        name: 'Test location',
        description: 'A description',
        parentId: null,
        isGameId: true,
      }),
    ).resolves.toEqual(createdLocation);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO locations'),
      expect.any(Array),
    );
    expect((connector.getOne.mock.calls[0][1]).slice(1)).toEqual([
      'Test location',
      'A description',
      null,
      true,
    ]);
  });

  it('returns paginated locations', async () => {
    connector.getMany.mockResolvedValue([{ id: 'location-1' }]);

    await expect(
      repository.getManyLocations({ pagination: { pageSize: 10, pageNumber: 0 } }),
    ).resolves.toEqual([{ id: 'location-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { pageSize: 10, pageNumber: 0 },
    });
    expect(connector.getMany).toHaveBeenCalledWith(
      expect.stringContaining('FROM locations'),
    );
  });
});
