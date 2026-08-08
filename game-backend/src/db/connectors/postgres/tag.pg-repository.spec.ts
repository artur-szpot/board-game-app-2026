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

  it('allows ordinary users to read their own and SYSTEM tags', async () => {
    connector.getOne.mockResolvedValue(null);

    await repository.getTagById('tag-1', { userId: 'user-1' });

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('(owner_id = $2 OR owner_id = $3)'),
      ['tag-1', 'user-1', 'SYSTEM'],
    );
  });

  it('creates a tag with a generated id', async () => {
    const created = {
      id: 'tag-1',
      ownerId: '123-abc',
      private: true,
      name: 'Strategy',
      description: 'Long and strategic games',
      parentId: null,
      createdOn: new Date(),
      updatedOn: new Date(),
    };
    connector.getOne.mockResolvedValue(created);

    await expect(
      repository.createTag(
        {
          name: 'Strategy',
          description: 'Long and strategic games',
          parentId: null,
        },
        '123-abc',
      ),
    ).resolves.toEqual(created);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO tags'),
      expect.any(Array),
    );
  });

  it('creates explicitly public tags', async () => {
    connector.getOne.mockResolvedValue({ id: 'tag-1' });

    await repository.createTag({ name: 'Shared' }, 'SYSTEM', false);

    expect(connector.getOne).toHaveBeenCalledWith(
      expect.stringContaining('VALUES ($1, $2, $3, $4, $5, $6)'),
      [expect.any(String), 'SYSTEM', false, 'Shared', null, null],
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

  it('transfers a tag to SYSTEM ownership and marks it public', async () => {
    connector.getOne
      .mockResolvedValueOnce({ id: 'tag-1', ownerId: 'user-1' })
      .mockResolvedValueOnce({
        id: 'tag-1',
        ownerId: 'SYSTEM',
        private: false,
      });

    await repository.makeTagSystemOwned('tag-1', { userId: 'user-1' });

    expect(connector.getOne).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('owner_id = $2'),
      ['tag-1', 'SYSTEM'],
    );
  });
});
