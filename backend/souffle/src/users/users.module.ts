import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserProblemProgress } from './entities/user_problem_progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProblemProgress])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
