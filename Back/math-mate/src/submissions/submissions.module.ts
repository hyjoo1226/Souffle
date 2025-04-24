import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/user.entity';
import { Problem } from 'src/problems/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FilesModule } from 'src/files/files.module';
import { OcrModule } from 'src/ocr/ocr.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, User, Problem, SubmissionStep]),
    FilesModule,
    OcrModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionsModule {}
