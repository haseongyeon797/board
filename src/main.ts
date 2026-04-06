import 'reflect-metadata';
import './session-types';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const rawOrigin = configService.get<string>('FRONTEND_ORIGIN');
  const allowList = rawOrigin
    ? rawOrigin
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];
  app.enableCors({
    origin:
      allowList.length > 0
        ? allowList
        : ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
  });

  const sessionSecret =
    configService.get<string>('SESSION_SECRET')?.trim() ||
    configService.get<string>('JWT_SECRET')?.trim() ||
    'dev-only-change-session-secret';

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 10 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Board API')
    .setDescription('게시판 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
