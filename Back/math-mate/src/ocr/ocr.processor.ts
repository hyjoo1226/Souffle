import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('ocr-queue')
export class OcrProcessor {
  @Process('ocr')
  async handleOcr(job: Job<{ answer_image_url: string }>) {
    const { answer_image_url } = job.data;
    // 실제 OCR 처리 로직 (예: 외부 OCR 서버에 HTTP 요청)
    // const result = await ocrService.runOcr(answer_image_url);
    // 예시: 임시 반환
    return { answer_convert: '변환된 텍스트' };
  }
}
