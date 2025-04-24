import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OcrProcessor } from './ocr.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ocr-queue',
    }),
  ],
  controllers: [OcrController],
  providers: [OcrService, OcrProcessor],
})
export class OcrModule {}
