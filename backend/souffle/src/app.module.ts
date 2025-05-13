import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SubmissionModule } from './submissions/submissions.module';
import { UserModule } from './users/users.module';
import { ProblemModule } from './problems/problems.module';
import { CategoryModule } from './categories/categories.module';
import { AnalysisModule } from './analyses/analyses.module';
import { BookModule } from './books/books.module';
import { FileModule } from './files/files.module';
import { OcrModule } from './ocr/ocr.module';
import { ConfigModule } from '@nestjs/config';
import { NoteModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    SubmissionModule,
    UserModule,
    ProblemModule,
    CategoryModule,
    AnalysisModule,
    BookModule,
    FileModule,
    MulterModule.register({
      dest: './uploads', // 파일이 저장될 로컬 경로(폴더)
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), 'uploads'), // 업로드 폴더를 정적 파일로 서빙
      serveRoot: '/uploads',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
    }),
    BullBoardModule.forRoot({
      route: '/queues', // 대시보드 접속 경로 (http://localhost:3000/queues)
      adapter: ExpressAdapter,
    }),
    OcrModule,
    NoteModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
