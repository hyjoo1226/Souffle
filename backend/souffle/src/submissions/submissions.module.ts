import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionController } from './submissions.controller';
import { SubmissionService } from './submissions.service';
import { FileModule } from 'src/files/files.module';
import { OcrModule } from 'src/ocr/ocr.module';
import { AnalysisModule } from 'src/analyses/analyses.module';
import { UserModule } from 'src/users/users.module';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/entities/user.entity';
import { Problem } from 'src/problems/entities/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { NoteFolder } from 'src/notes/entities/note-folder.entity';
import { NoteContent } from 'src/notes/entities/note-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      User,
      Problem,
      SubmissionStep,
      NoteFolder,
      NoteContent,
    ]),
    FileModule,
    OcrModule,
    AnalysisModule,
    UserModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [TypeOrmModule],
})
export class SubmissionModule {}
