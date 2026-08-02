import { PostgresHelperRepository } from './helper.pg-repository';

describe('PostgresHelperRepository', () => {
  let connector: any;
  let repository: PostgresHelperRepository;

  beforeEach(() => {
    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
    };
    repository = new PostgresHelperRepository(connector);
  });

  it('returns null when a helper is missing', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(repository.getHelperById('missing')).resolves.toBeNull();
    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('FROM helpers'),
      ['missing'],
    );
  });

  it('allows ordinary users to read their own and SYSTEM helpers', async () => {
    connector.getOne.mockResolvedValue(null);

    await repository.getHelperById('helper-1', { userId: 'user-1' });

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('(owner_id = $2 OR owner_id = $3)'),
      ['helper-1', 'user-1', 'SYSTEM'],
    );
  });

  it('creates a helper with logic payload', async () => {
    const created = {
      id: 'helper-1',
      name: 'Score Helper',
      logic: { rules: [] },
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connector.getOne.mockResolvedValue(created);

    await expect(
      repository.createHelper(
        { name: 'Score Helper', logic: { rules: [] } },
        'user-1',
      ),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO helpers'),
      expect.any(Array),
    );
  });

  it('creates explicitly public helpers', async () => {
    connector.getOne.mockResolvedValue({ id: 'helper-1' });
    const input = { name: 'Shared', logic: {} };

    await repository.createHelper(input, 'SYSTEM', false);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('VALUES ($1, $2, $3, $4, $5)'),
      [expect.any(String), 'SYSTEM', false, 'Shared', {}],
    );
  });

  it('returns many helpers using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'helper-1' }]);

    await expect(
      repository.getManyHelpers({ pagination: { pageSize: 5, pageNumber: 0 } }),
    ).resolves.toEqual([{ id: 'helper-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { pageSize: 5, pageNumber: 0 },
    });
  });
});
