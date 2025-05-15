import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { UserProblem } from './entities/user-problem.entity';
import { User } from './entities/user.entity';
import { UserAuthentication } from './entities/user-authentication.entity';
import { UserReport } from './entities/user-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAuthentication,
      UserCategoryProgress,
      UserProblem,
      UserReport,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
