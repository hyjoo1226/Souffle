import { Module } from '@nestjs/common';
import { SubmissionsModule } from './submissions/submissions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), SubmissionsModule, UsersModule, ProblemsModule],
})
export class AppModule {}
