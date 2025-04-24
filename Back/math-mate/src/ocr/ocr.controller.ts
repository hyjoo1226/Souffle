import { Controller, Post, Body } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('data/api/answer')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('ocr')
  async ocr(@Body() body: { answer_image_url: string }) {
    // 큐에 작업 추가 요청
    return this.ocrService.addOcrJob(body.answer_image_url);
  }
}
