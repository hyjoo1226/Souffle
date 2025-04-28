import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submissions.controller';
import { SubmissionService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/entities/user.entity';
import { Problem } from 'src/problems/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FilesModule } from 'src/files/files.module';
import { OcrModule } from 'src/ocr/ocr.module';
import { AnalysesModule } from 'src/analyses/analyses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, User, Problem, SubmissionStep]),
    FilesModule,
    OcrModule,
    AnalysesModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionsModule {}
