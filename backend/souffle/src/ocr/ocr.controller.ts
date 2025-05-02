import { Controller, Post, Body } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('data/api/v1/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('answer')
  async ocr(
    @Body()
    body: {
      answer_image_url: string;
      // submission_id: number;
      // problem_answer: string;
    },
  ) {
    // 동기 방식 OCR 변환 요청
    const answer_convert = await this.ocrService.convertOcr(
      body.answer_image_url,
    );

    return { answer_convert };
  }
  // {
  //   // 큐에 작업 추가 요청
  //   return this.ocrService.addOcrJob({
  //     answer_image_url: body.answer_image_url,
  //     submission_id: body.submission_id,
  //     problem_answer: body.problem_answer,
  //   });
  // }
}
