import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { GameController } from './game.controller';
import { GAME_GATEWAY } from './infrastructure/game.gateway';

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

  it('creates a game endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'game-1',
      name: 'Catan',
      description: 'Trade and build',
      length: 'MEDIUM',
      minPlayers: 3,
      maxPlayers: 4,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Catan',
        description: 'Trade and build',
        length: 'MEDIUM',
        minPlayers: 3,
        maxPlayers: 4,
      }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'game-1', name: 'Catan' }),
    );
    expect(gateway.create).toHaveBeenCalledWith(
      {
        name: 'Catan',
        description: 'Trade and build',
        length: 'MEDIUM',
        minPlayers: 3,
        maxPlayers: 4,
      },
      '123-abc',
    );
  });

  it('rejects a game create request without minPlayers', async () => {
    const response = await fetch(`${baseUrl}/game-api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Catan',
        description: 'Trade and build',
        length: 'MEDIUM',
        maxPlayers: 4,
      }),
    });

    expect(response.status).toBe(400);
    expect(gateway.create).not.toHaveBeenCalled();
  });

  it('rejects a game create request without maxPlayers', async () => {
    const response = await fetch(`${baseUrl}/game-api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Catan',
        description: 'Trade and build',
        length: 'MEDIUM',
        minPlayers: 3,
      }),
    });

    expect(response.status).toBe(400);
    expect(gateway.create).not.toHaveBeenCalled();
  });

  it('rejects a game create request when maxPlayers is below minPlayers', async () => {
    const response = await fetch(`${baseUrl}/game-api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Catan',
        description: 'Trade and build',
        length: 'MEDIUM',
        minPlayers: 4,
        maxPlayers: 3,
      }),
    });

    expect(response.status).toBe(400);
    expect(gateway.create).not.toHaveBeenCalled();
  });

  it('retrieves a game by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'game-1',
      name: 'Catan',
      description: 'Trade and build',
      length: 'MEDIUM',
      minPlayers: 3,
      maxPlayers: 4,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/games/game-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'game-1', name: 'Catan' }),
    );
    expect(gateway.getById).toHaveBeenCalledWith('game-1', '123-abc', false);
  });
});
