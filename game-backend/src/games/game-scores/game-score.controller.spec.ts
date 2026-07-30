import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { GAME_SCORE_GATEWAY } from './game-score.gateway';
import { GameScoreController } from './game-score.controller';

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
    }).compile();

    app = moduleRef.createNestApplication();
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
    gateway.create.mockResolvedValue({
      id: 'score-1',
      gameId: 'game-1',
      playedOn: '2026-07-18',
      schema: { points: 'number' },
      scores: { alice: 32, bob: 28 },
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
        scores: { alice: 32, bob: 28 },
      }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'score-1', gameId: 'game-1' }),
    );
    expect(gateway.create).toHaveBeenCalledWith({
      gameId: 'game-1',
      playedOn: '2026-07-18',
      schemaId: 'schema-1',
      scores: { alice: 32, bob: 28 },
    });
  });

  it('retrieves a game score by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'score-1',
      gameId: 'game-1',
      playedOn: '2026-07-18',
      schema: { points: 'number' },
      scores: { alice: 32, bob: 28 },
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    });

    const response = await fetch(`${baseUrl}/game-api/game-scores/score-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'score-1', gameId: 'game-1' }),
    );
    expect(gateway.getById).toHaveBeenCalledWith('score-1');
  });
});