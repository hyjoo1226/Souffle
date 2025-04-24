import { Module } from '@nestjs/common';
import { SubmissionsModule } from './submissions/submissions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { typeORMConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { CategoriesModule } from './categories/categories.module';
import { AnalysesModule } from './analyses/analyses.module';
import { BooksModule } from './books/books.module';
import { FilesModule } from './files/files.module';

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
      serveRoot: '/uploads', // http://localhost:3000/uploads/파일명 으로 접근 가능
    }),
  ],
})
export class AppModule {}
