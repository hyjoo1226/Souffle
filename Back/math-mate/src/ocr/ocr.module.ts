import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OcrProcessor } from './ocr.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ocr-queue',
      defaultJobOptions: {
        attempts: 3, // 3번 재시도
        backoff: { type: 'exponential', delay: 1000 }, // 1초, 2초, 4초 간격
      },
    }),
    BullBoardModule.forFeature({
      name: 'ocr-queue',
      adapter: BullAdapter,
    }),
    HttpModule,
  ],
  controllers: [OcrController],
  providers: [OcrService, OcrProcessor],
  exports: [OcrService],
})
export class OcrModule {}
