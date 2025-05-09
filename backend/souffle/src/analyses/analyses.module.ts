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
    BullModule.registerQueue({
      name: 'analysis-queue',
      defaultJobOptions: {
        attempts: 3, // 최대 3번 시도
        backoff: { type: 'exponential', delay: 5000 }, // 5초, 10초, 20초 간격 재시도
        removeOnComplete: true, // 완료된 작업은 큐에서 자동 삭제
        removeOnFail: false, // 실패한 작업은 큐에 남김 (디버깅/모니터링용)
        timeout: 60000, // 60초 이상 걸리면 타임아웃 처리
      },
    }),
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
export class AnalysisModule {}
