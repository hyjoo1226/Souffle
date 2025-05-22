import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { NoteModule } from 'src/notes/notes.module';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { UserProblem } from './entities/user-problem.entity';
import { User } from './entities/user.entity';
import { UserAuthentication } from './entities/user-authentication.entity';
import { UserReport } from './entities/user-report.entity';
import { UserScoreStat } from './entities/user-score-stat.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { Problem } from 'src/problems/entities/problem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAuthentication,
      UserCategoryProgress,
      UserProblem,
      UserReport,
      UserScoreStat,
      Category,
      Submission,
      Problem,
    ]),
    NoteModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
