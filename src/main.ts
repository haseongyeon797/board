import 'reflect-metadata';
import './session-types';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
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
    origin: allowList.length > 0 ? allowList : true, // 개발: 요청 Origin 그대로 허용 (credentials와 함께 사용)
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
      saveUninitialized: true,
      cookie: { maxAge: 10 * 60 * 1000 },
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
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
