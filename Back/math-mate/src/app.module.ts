import { Module } from '@nestjs/common';
import { SubmissionsModule } from './submissions/submissions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), SubmissionsModule],
})
export class AppModule {}
