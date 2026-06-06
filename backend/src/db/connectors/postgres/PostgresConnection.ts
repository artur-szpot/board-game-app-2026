import { Logger } from '@nestjs/common';

export class PostgresConnection {
  constructor(
    private readonly logger: Logger,
    private readonly connection: any,
  ) {}

  public async query<T>(query: string, args?: any): Promise<{ rows: T[] }> {
    this.logger.debug(
      `Running query: ${query} ${args ? `with args: ${JSON.stringify(args)}` : ''}`,
    );
    return this.connection.query(query, args);
  }

  public release(): void {
    this.logger.debug(`Connection released`);
    this.connection.release();
  }
}
