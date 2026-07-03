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
      repository.createHelper({ name: 'Score Helper', logic: { rules: [] } }),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO helpers'),
      expect.any(Array),
    );
  });

  it('returns many helpers using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'helper-1' }]);

    await expect(
      repository.getManyHelpers({ take: 5, skip: 0 }),
    ).resolves.toEqual([{ id: 'helper-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { take: 5, skip: 0 },
    });
  });
});