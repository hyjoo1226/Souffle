import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';
import { Category } from './entities/category.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Category, Problem, Submission]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
