import { PostgresGameRepository } from './game.pg-repository';

describe('PostgresGameRepository', () => {
  it('creates an instance', () => {
    const connector = {
      getOne: jest.fn(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      searchSQL: jest.fn().mockReturnValue('ORDER BY name ASC'),
    } as any;

    const repository = new PostgresGameRepository(connector);
    expect(repository).toBeDefined();
  });
});
