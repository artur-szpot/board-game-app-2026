import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PostgresConnector } from '../db/connectors/postgres/PostgresConnector';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const connector = {
      healthCheck: jest.fn().mockResolvedValue(true),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PostgresConnector, useValue: connector }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns live health', async () => {
    const response = await fetch(
      'http://127.0.0.1:' + app.getHttpServer().address().port + '/health/live',
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('returns ready health when the database is reachable', async () => {
    const response = await fetch(
      'http://127.0.0.1:' +
        app.getHttpServer().address().port +
        '/health/ready',
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
