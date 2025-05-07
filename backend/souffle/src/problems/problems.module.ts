import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemController } from './problems.controller';
import { ProblemService } from './problems.service';
import { Problem } from './entities/problem.entity';
import { Book } from 'src/books/entities/book.entity';
import { CategoryModule } from 'src/categories/categories.module';

@Module({
  imports: [CategoryModule, TypeOrmModule.forFeature([Problem, Book])],
  controllers: [ProblemController],
  providers: [ProblemService],
  exports: [ProblemService],
})
export class ProblemModule {}
