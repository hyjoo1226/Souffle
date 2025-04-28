import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AnalysisService } from './analyses.service';
import { AnalysisController } from './analyses.controller';
import { AnalysisProcessor } from './analyses.processor';
import { Submission } from 'src/submissions/entities/submission.entity';
import { SubmissionStep } from 'src/submissions/entities/submission-step.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'analysis-queue' }),
    BullBoardModule.forFeature({
      name: 'analysis-queue',
      adapter: BullAdapter,
    }),
    TypeOrmModule.forFeature([Submission, SubmissionStep]),
    HttpModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisProcessor],
  exports: [AnalysisService],
})
export class AnalysesModule {}
