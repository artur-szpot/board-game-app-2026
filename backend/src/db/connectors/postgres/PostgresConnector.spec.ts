import { PostgresConnector } from './PostgresConnector';

const normalizeSQL = (input: string): string =>
  input.replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim();

describe('PostgresConnector', () => {
  const connector = new PostgresConnector();

  it('should construct empty search SQL', async () => {
    const result = normalizeSQL(connector.searchSQL());
    expect(result).toStrictEqual('');
  });

  it('should construct search SQL with WHERE', async () => {
    const result = normalizeSQL(connector.searchSQL({ where: 'TEST = 1' }));
    expect(result).toStrictEqual('WHERE TEST = 1');
  });

  it('should construct search SQL with ORDER BY', async () => {
    const result = normalizeSQL(
      connector.searchSQL({ orderBy: 'example ASC' }),
    );
    expect(result).toStrictEqual('ORDER BY example ASC');
  });

  it('should construct search SQL with pagination', async () => {
    const result = normalizeSQL(
      connector.searchSQL({
        pagination: { pageNumber: 2, pageSize: 4 },
      }),
    );
    expect(result).toStrictEqual('LIMIT 4 OFFSET 8');
  });

  it('should construct search SQL with all parameters', async () => {
    const result = normalizeSQL(
      connector.searchSQL({
        where: 'TEST = 1',
        orderBy: 'example ASC',
        pagination: { pageNumber: 2, pageSize: 4 },
      }),
    );
    expect(result).toStrictEqual(
      'WHERE TEST = 1 ORDER BY example ASC LIMIT 4 OFFSET 8',
    );
  });
});
