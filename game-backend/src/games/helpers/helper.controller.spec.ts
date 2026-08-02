import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { PermisionsGuard } from '@auth/guards/permissions.guard';
import { HelperController } from './helper.controller';
import { HELPER_GATEWAY } from './infrastructure/helper.gateway';

describe('HelperController', () => {
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
      controllers: [HelperController],
      providers: [{ provide: HELPER_GATEWAY, useValue: gateway }],
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

  it('creates a helper endpoint', async () => {
    gateway.create.mockResolvedValue({
      id: 'helper-1',
      ownerId: '123-abc',
      private: true,
      name: 'Auto Score',
      logic: { rules: [] },
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/helpers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Score', logic: { rules: [] } }),
    });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'helper-1', name: 'Auto Score' }),
    );
    expect(gateway.create).toHaveBeenCalledWith(
      {
        name: 'Auto Score',
        logic: { rules: [] },
      },
      '123-abc',
    );
  });

  it('retrieves a helper by id endpoint', async () => {
    gateway.getById.mockResolvedValue({
      id: 'helper-1',
      ownerId: '123-abc',
      private: true,
      name: 'Auto Score',
      logic: { rules: [] },
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    const response = await fetch(`${baseUrl}/game-api/helpers/helper-1`);

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual(
      expect.objectContaining({ id: 'helper-1', name: 'Auto Score' }),
    );
    expect(gateway.getById).toHaveBeenCalledWith('helper-1', {
      userId: '123-abc',
      hasCollectionSuperuserPermission: false,
    });
  });
});
