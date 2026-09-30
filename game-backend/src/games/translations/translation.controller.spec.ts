import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { TranslationService } from './infrastructure/translation.service';
import { TranslationController } from './translation.controller';

describe('TranslationController', () => {
  let app: INestApplication;
  let baseUrl: string;
  const service = { lookup: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TranslationController],
      providers: [{ provide: TranslationService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    await app.listen(0);
    baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (body: unknown) =>
    fetch(`${baseUrl}/game-api/translations/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('returns lookup results with status 200', async () => {
    service.lookup.mockResolvedValue({ translations: {}, missing: ['a'] });

    const response = await post({ keys: ['a'], language: 'pl' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      translations: {},
      missing: ['a'],
    });
  });

  it('rejects malformed languages', async () => {
    const response = await post({ keys: ['a'], language: 'polish' });
    expect(response.status).toBe(400);
  });
});
