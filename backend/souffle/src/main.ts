import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('풀이 분석 API')
    .setDescription('제출, 분석, 통계 등 API 명세')
    .setVersion('1.0')
    .addTag('submission')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // http://localhost:3000/swagger

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
