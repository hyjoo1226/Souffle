import { Module } from '@nestjs/common';
import { SubmissionsModule } from './submissions/submissions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { CategoriesModule } from './categories/categories.module';
import { AnalysesModule } from './analyses/analyses.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    SubmissionsModule,
    UsersModule,
    ProblemsModule,
    CategoriesModule,
    AnalysesModule,
    BooksModule,
  ],
})
export class AppModule {}
