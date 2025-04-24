import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SubmissionsModule } from './submissions/submissions.module';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { CategoriesModule } from './categories/categories.module';
import { AnalysesModule } from './analyses/analyses.module';
import { BooksModule } from './books/books.module';
import { FilesModule } from './files/files.module';
import { OcrModule } from './ocr/ocr.module';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    SubmissionsModule,
    UsersModule,
    ProblemsModule,
    CategoriesModule,
    AnalysesModule,
    BooksModule,
    FilesModule,
    MulterModule.register({
      dest: './uploads', // 파일이 저장될 로컬 경로(폴더)
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 업로드 폴더를 정적 파일로 서빙
      serveRoot: '/uploads',
    }),
    BullModule.forRoot({
      redis: { host: 'localhost', port: 6379 },
    }),
    OcrModule,
  ],
})
export class AppModule {}
