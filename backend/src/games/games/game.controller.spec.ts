import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { GAME_GATEWAY } from './infrastructure/game.gateway';
import { GameController } from './game.controller';

describe('GameController', () => {
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
      controllers: [GameController],
      providers: [{ provide: GAME_GATEWAY, useValue: gateway }],
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

  it('creates a game endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'game-1',
      name: 'Catan',
      description: 'Trade and build',
      length: 'medium',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Catan', description: 'Trade and build', length: 'medium' }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'game-1', name: 'Catan' }));
    expect(gateway.create).toHaveBeenCalledWith({
      name: 'Catan',
      description: 'Trade and build',
      length: 'medium',
    });
  });

  it('retrieves a game by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'game-1',
      name: 'Catan',
      description: 'Trade and build',
      length: 'medium',
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/games/game-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(expect.objectContaining({ id: 'game-1', name: 'Catan' }));
    expect(gateway.getById).toHaveBeenCalledWith('game-1');
  });
});