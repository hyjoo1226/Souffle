import { Controller, Post, Body } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('data/api/answer')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('ocr')
  async ocr(
    @Body()
    body: {
      answer_image_url: string;
      submission_id: number;
      problem_answer: string;
    },
  ) {
    // 큐에 작업 추가 요청
    return this.ocrService.addOcrJob({
      answer_image_url: body.answer_image_url,
      submission_id: body.submission_id,
      problem_answer: body.problem_answer,
    });
  }
}
