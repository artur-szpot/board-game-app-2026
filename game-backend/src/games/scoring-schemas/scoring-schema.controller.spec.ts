import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => Record<string, unknown> };
        }) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: '123-abc', permissions: [] };
          return true;
        },
      })
      .overrideGuard(PermisionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
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
      ownerId: '123-abc',
      private: true,
      name: 'Default',
      schema: { points: 1 },
      description: 'A scoring schema',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/scoring-schemas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Default',
        schema: { points: 1 },
        description: 'A scoring schema',
      }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'schema-1', name: 'Default' }),
    );
    expect(gateway.create).toHaveBeenCalledWith(
      {
        name: 'Default',
        schema: { points: 1 },
        description: 'A scoring schema',
      },
      '123-abc',
    );
  });

  it('retrieves a scoring schema by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'schema-1',
      ownerId: '123-abc',
      private: true,
      name: 'Default',
      schema: { points: 1 },
      description: 'A scoring schema',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(
      `${baseUrl}/game-api/scoring-schemas/schema-1`,
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'schema-1', name: 'Default' }),
    );
    expect(gateway.getById).toHaveBeenCalledWith('schema-1', '123-abc', false);
  });
});
