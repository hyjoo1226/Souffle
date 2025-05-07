import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { UserCategoryProgress } from './entities/user_category_progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserCategoryProgress])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
