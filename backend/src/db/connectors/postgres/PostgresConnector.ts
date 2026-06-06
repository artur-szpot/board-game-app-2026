import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

import { DbSearchDto } from '@db/dto/search.dto';
import { PostgresConnection } from './PostgresConnection';

@Injectable()
export class PostgresConnector {
  private pool: Pool | null = null;

  private readonly logger = new Logger(PostgresConnector.name);

  constructor() {
    this.connectPool();
  }

  private connectPool() {
    this.pool = new Pool({
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: Number.parseInt(process.env.DATABASE_PORT, 10) ?? 5432,
    });

    this.pool.connect((err: any, client: any, release: () => void) => {
      if (err) {
        this.logger.error('Error connecting to the database', err);
        return;
      }
      this.logger.debug('Connected to the database');
      release();
    });
  }

  public async getConnection(): Promise<PostgresConnection> {
    if (!this.pool) {
      this.connectPool();
    }
    const connection = await this.pool.connect();
    return new PostgresConnection(this.logger, connection);
  }

  public searchSQL = (args?: DbSearchDto): string => {
    const { where, orderBy, pagination } = args ?? {};
    const { pageNumber, pageSize } = pagination ?? {};
    return `
       ${where ? `WHERE ${where}` : ''}
       ${orderBy ? `ORDER BY ${orderBy}` : ''}
       ${pagination ? `LIMIT ${pageSize} OFFSET ${pageNumber * pageSize}` : ''}
    `;
  };

  public async getOne<T>(query: string, args?: any[]): Promise<T | null> {
    const connection = await this.getConnection();
    const resultRaw = await connection.query<T>(query, args);
    connection.release();
    if (!resultRaw?.rows?.[0]) {
      return null;
    }
    const result = resultRaw?.rows?.[0];
    this.logger.debug(`Fetched ${JSON.stringify(result)}`);
    return result;
  }

  public async getMany<T>(query: string, args?: any[]): Promise<T[]> {
    const connection = await this.getConnection();
    const resultRaw = await connection.query<T>(query, args);
    connection.release();
    if (!resultRaw?.rows) {
      return [];
    }
    const result = resultRaw.rows;
    this.logger.debug(`Fetched ${result.length} results`);
    return result;
  }

  public async getCount(query: string): Promise<number> {
    const connection = await this.getConnection();
    const resultRaw = await connection.query<{ total: number }>(query);
    connection.release();
    if (!resultRaw?.rows?.[0]) {
      return 0;
    }
    return resultRaw.rows[0].total;
  }
}
