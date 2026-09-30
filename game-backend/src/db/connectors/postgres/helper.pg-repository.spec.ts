import { PostgresHelperRepository } from './helper.pg-repository';

describe('PostgresHelperRepository', () => {
  let connector: any;
  let connection: { query: jest.Mock; release: jest.Mock };
  let repository: PostgresHelperRepository;

  beforeEach(() => {
    connection = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      getConnection: jest.fn().mockResolvedValue(connection),
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

  it('creates a helper and its set links in one transaction', async () => {
    const created = {
      id: 'helper-1',
      name: 'Score Helper',
      logic: { rules: [] },
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connection.query.mockImplementation((sql: string) =>
      Promise.resolve({
        rows: sql.includes('INSERT INTO helpers') ? [created] : [],
      }),
    );

    await expect(
      repository.createHelper(
        { name: 'Score Helper', logic: { rules: [] } },
        'user-1',
        true,
        ['set-1'],
      ),
    ).resolves.toEqual(created);

    const statements = connection.query.mock.calls.map(([sql]) => sql);
    expect(statements[0]).toBe('BEGIN');
    expect(statements[1]).toContain('INSERT INTO helpers');
    expect(statements[3]).toContain('INSERT INTO helper_sets');
    expect(connection.query.mock.calls[3][1]).toEqual([
      expect.any(String),
      ['set-1'],
    ]);
    expect(statements.at(-1)).toBe('COMMIT');
    expect(connection.release).toHaveBeenCalled();
  });

  it('rolls back when writing set links fails', async () => {
    connection.query.mockImplementation((sql: string) =>
      sql.includes('INSERT INTO helper_sets')
        ? Promise.reject(new Error('fk'))
        : Promise.resolve({ rows: [{ id: 'helper-1' }] }),
    );

    await expect(
      repository.createHelper({ name: 'x', logic: {} }, 'user-1', true, [
        'missing',
      ]),
    ).rejects.toThrow('fk');
    expect(connection.query).toHaveBeenCalledWith('ROLLBACK');
    expect(connection.release).toHaveBeenCalled();
  });

  it('creates explicitly public helpers', async () => {
    const input = { name: 'Shared', logic: {} };

    await repository.createHelper(input, 'SYSTEM', false);

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining('VALUES ($1, $2, $3, $4, $5)'),
      [expect.any(String), 'SYSTEM', false, 'Shared', '{}'],
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
