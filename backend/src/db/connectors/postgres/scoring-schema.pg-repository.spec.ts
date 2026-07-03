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

    await expect(repository.getScoringSchemaById('missing')).resolves.toBeNull();
    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('FROM scoring_schemas'),
      ['missing'],
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
      repository.createScoringSchema({
        name: 'Default',
        schema: { points: 1 },
        description: 'A scoring schema',
      }),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO scoring_schemas'),
      expect.any(Array),
    );
  });

  it('returns many scoring schemas using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'schema-1' }]);

    await expect(
      repository.getManyScoringSchemas({ take: 10, skip: 0 }),
    ).resolves.toEqual([{ id: 'schema-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { take: 10, skip: 0 },
    });
  });
});