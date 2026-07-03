import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { SCORING_SCHEMA_GATEWAY } from './infrastructure/scoring-schema.gateway';
import { ScoringSchemaController } from './scoring-schema.controller';

describe('ScoringSchemaController', () => {
  let app: INestApplication;
  let baseUrl: string;
  const gateway = {
    getById: jest.fn(),
    getMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ScoringSchemaController],
      providers: [{ provide: SCORING_SCHEMA_GATEWAY, useValue: gateway }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(0);

    const address = (app.getHttpServer()).address();
    const port = address?.port || 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a scoring schema endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'schema-1',
      name: 'Default',
      schema: { points: 1 },
      description: 'A scoring schema',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/scoring-schemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Default', schema: { points: 1 }, description: 'A scoring schema' }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'schema-1', name: 'Default' }));
    expect(gateway.create).toHaveBeenCalledWith({
      name: 'Default',
      schema: { points: 1 },
      description: 'A scoring schema',
    });
  });

  it('retrieves a scoring schema by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'schema-1',
      name: 'Default',
      schema: { points: 1 },
      description: 'A scoring schema',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/scoring-schemas/schema-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'schema-1', name: 'Default' }));
    expect(gateway.getById).toHaveBeenCalledWith('schema-1');
  });
});