import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { UserProblem } from './entities/user-problem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCategoryProgress, UserProblem])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
