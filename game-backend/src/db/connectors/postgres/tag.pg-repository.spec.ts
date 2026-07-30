import { PostgresTagRepository } from './tag.pg-repository';

describe('PostgresTagRepository', () => {
  let connector: any;
  let repository: PostgresTagRepository;

  beforeEach(() => {
    connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
    };
    repository = new PostgresTagRepository(connector);
  });

  it('returns null when a tag is missing', async () => {
    connector.getOne.mockResolvedValue(null);

    await expect(repository.getTagById('missing')).resolves.toBeNull();
    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('FROM tags'),
      ['missing'],
    );
  });

  it('creates a tag with a generated id', async () => {
    const created = {
      id: 'tag-1',
      name: 'Strategy',
      description: 'Long and strategic games',
      parentId: null,
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connector.getOne.mockResolvedValue(created);

    await expect(
      repository.createTag({
        name: 'Strategy',
        description: 'Long and strategic games',
        parentId: null,
      }),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO tags'),
      expect.any(Array),
    );
  });

  it('returns many tags using searchSQL', async () => {
    connector.getMany.mockResolvedValue([{ id: 'tag-1' }]);

    await expect(
      repository.getManyTags({ pagination: { pageSize: 20, pageNumber: 0 } }),
    ).resolves.toEqual([{ id: 'tag-1' }]);

    expect(connector.searchSQL).toHaveBeenCalledWith({
      orderBy: 'name ASC',
      pagination: { pageSize: 20, pageNumber: 0 },
    });
  });
});
