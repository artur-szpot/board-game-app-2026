import { paginationMapper } from './pagination.mapper';

describe('paginationMapper', () => {
  it('should return Pagination if arguments are correct', () => {
    const result = paginationMapper.fromDto({ pageNumber: 0, pageSize: 2 });
    expect(result).toStrictEqual({ pageNumber: 0, pageSize: 2 });
  });

  it('should return undefined if any pageSize is equal to zero', () => {
    const result = paginationMapper.fromDto({ pageNumber: 0, pageSize: 0 });
    expect(result).toStrictEqual(undefined);
  });

  it('should return undefined if any pageSize is undefined', () => {
    const result = paginationMapper.fromDto({ pageNumber: 0 });
    expect(result).toStrictEqual(undefined);
  });

  it('should return undefined if any pageNumber is undefined', () => {
    const result = paginationMapper.fromDto({ pageSize: 1 });
    expect(result).toStrictEqual(undefined);
  });
});
