import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // 환경에 따라 로깅 레벨 분리
  if (process.env.NODE_ENV === 'production') {
    app.useLogger(['error', 'warn', 'log']);
  } else {
    app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);
  }

  const config = new DocumentBuilder()
    .setTitle('풀이 분석 API')
    .setDescription('제출, 분석, 통계 등 API 명세')
    .setVersion('1.0')
    .addTag('submission')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // http://localhost:4000/swagger
  app.enableCors({
    origin: 'https://www.souffle.kr',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
