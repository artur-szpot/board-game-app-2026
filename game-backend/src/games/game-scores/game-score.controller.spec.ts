import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { GameScoreController } from './game-score.controller';
import { GAME_SCORE_GATEWAY } from './game-score.gateway';

describe('GameScoreController', () => {
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
      controllers: [GameScoreController],
      providers: [{ provide: GAME_SCORE_GATEWAY, useValue: gateway }],
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

  it('creates a game score endpoint', async () => {
    const scores = {
      players: ['alice', 'bob'],
      values: { 'row-coins': { alice: 32, bob: 28 } },
    };
    gateway.create.mockResolvedValue({
      id: 'score-1',
      ownerId: '123-abc',
      private: true,
      gameId: 'game-1',
      playedOn: '2026-07-18',
      schemaId: 'schema-1',
      scores,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    });

    const response = await fetch(`${baseUrl}/game-api/game-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: 'game-1',
        playedOn: '2026-07-18',
        schemaId: 'schema-1',
        scores,
      }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'score-1', gameId: 'game-1' }),
    );
    expect(gateway.create).toHaveBeenCalledWith(
      {
        gameId: 'game-1',
        playedOn: '2026-07-18',
        schemaId: 'schema-1',
        scores,
      },
      '123-abc',
    );
  });

  it('lists game scores filtered by game', async () => {
    gateway.getMany.mockResolvedValue({ page: [], total: 0 });

    const response = await fetch(
      `${baseUrl}/game-api/game-scores?gameId=game-1&pageSize=5`,
    );

    expect(response.status).toBe(200);
    expect(gateway.getMany).toHaveBeenCalledWith({
      userId: '123-abc',
      hasCollectionSuperuserPermission: false,
      filters: { gameId: 'game-1' },
      pagination: { pageNumber: 0, pageSize: 5 },
    });
  });

  it('retrieves a game score by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'score-1',
      ownerId: '123-abc',
      private: true,
      gameId: 'game-1',
      playedOn: '2026-07-18',
      schemaId: 'schema-1',
      scores: { players: ['alice'], values: { 'row-coins': { alice: 32 } } },
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    });

    const response = await fetch(`${baseUrl}/game-api/game-scores/score-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'score-1', gameId: 'game-1' }),
    );
    expect(gateway.getById).toHaveBeenCalledWith('score-1', {
      userId: '123-abc',
      hasCollectionSuperuserPermission: false,
    });
  });
});
