import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteController } from './notes.controller';
import { NoteService } from './notes.service';
import { NoteFolder } from './entities/note-folder.entity';
import { NoteContent } from './entities/note-content.entity';
import { UserProblem } from 'src/users/entities/user-problem.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { SubmissionStep } from 'src/submissions/entities/submission-step.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NoteFolder,
      NoteContent,
      UserProblem,
      Submission,
      SubmissionStep,
    ]),
  ],
  providers: [NoteService],
  controllers: [NoteController],
  exports: [TypeOrmModule],
})
export class NoteModule {}
