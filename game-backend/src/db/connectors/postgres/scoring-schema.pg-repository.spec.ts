import { PostgresScoringSchemaRepository } from './scoring-schema.pg-repository';

describe('PostgresScoringSchemaRepository', () => {
  let connector: any;
  let repository: PostgresScoringSchemaRepository;

  beforeEach(() => {
    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
    };
    repository = new PostgresScoringSchemaRepository(connector);
  });

  it('returns null when a scoring schema is missing', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(
      repository.getScoringSchemaById('missing'),
    ).resolves.toBeNull();
    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('FROM scoring_schemas'),
      ['missing'],
    );
  });

  it('allows ordinary users to read their own and SYSTEM schemas', async () => {
    connector.getOne.mockResolvedValue(null);

    await repository.getScoringSchemaById('schema-1', { userId: 'user-1' });

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('(owner_id = $2 OR owner_id = $3)'),
      ['schema-1', 'user-1', 'SYSTEM'],
    );
  });

  it('creates a scoring schema with schema payload', async () => {
    const created = {
      id: 'schema-1',
      name: 'Default',
      schema: { points: 1 },
      description: 'A scoring schema',
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connector.getOne.mockResolvedValue(created);

    await expect(
      repository.createScoringSchema(
        {
          name: 'Default',
          schema: { points: 1 },
          description: 'A scoring schema',
        },
        'user-1',
      ),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO scoring_schemas'),
      expect.any(Array),
    );
  });

  it('creates explicitly public scoring schemas', async () => {
    connector.getOne.mockResolvedValue({ id: 'schema-1' });
    const input = { name: 'Shared', schema: { points: 1 } };

    await repository.createScoringSchema(input, 'SYSTEM', false);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('VALUES ($1, $2, $3, $4, $5, $6)'),
      [expect.any(String), 'SYSTEM', false, 'Shared', { points: 1 }, null],
    );
  });

  it('returns many scoring schemas using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'schema-1' }]);

    await expect(
      repository.getManyScoringSchemas({
        pagination: { pageSize: 10, pageNumber: 0 },
      }),
    ).resolves.toEqual([{ id: 'schema-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { pageSize: 10, pageNumber: 0 },
    });
  });
});
