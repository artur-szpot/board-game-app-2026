import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();

  //   const configService = app.get(ConfigService);
  //   const allowedOrigins =
  //     configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [];

  //   app.enableCors({
  //     origin: (origin, callback) => {
  //       if (!origin || allowedOrigins.includes(origin)) {
  //         callback(null, true);
  //       } else {
  //         callback(new Error('Not allowed by CORS'));
  //       }
  //     },
  //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  //     credentials: true,
  //   });

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
