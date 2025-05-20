import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';
import { UserModule } from 'src/users/users.module';
import { Category } from './entities/category.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Concept } from 'src/concepts/entities/concept.entity';
import { ConceptImage } from 'src/concepts/entities/concept-image.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      Category,
      Concept,
      ConceptImage,
      Problem,
      Submission,
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [TypeOrmModule],
})
export class CategoryModule {}
