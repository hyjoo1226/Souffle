import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submissions.controller';
import { SubmissionService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/entities/user.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FileModule } from 'src/files/files.module';
import { OcrModule } from 'src/ocr/ocr.module';
import { AnalysisModule } from 'src/analyses/analyses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, User, Problem, SubmissionStep]),
    FileModule,
    OcrModule,
    AnalysisModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [TypeOrmModule],
})
export class SubmissionModule {}
