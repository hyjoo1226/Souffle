import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { UserReport } from 'src/users/entities/user-report.entity';
import { HttpModule } from '@nestjs/axios';
import { UserScoreStat } from 'src/users/entities/user-score-stat.entity';
import { User } from 'src/users/entities/user.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { UserProblem } from 'src/users/entities/user-problem.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      UserReport,
      User,
      UserScoreStat,
      Submission,
      UserProblem,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
