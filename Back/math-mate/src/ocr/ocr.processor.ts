import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Processor('ocr-queue')
export class OcrProcessor {
  constructor(private readonly httpService: HttpService) {}

  @Process('ocr')
  async handleOcr(job: Job<{ answer_image_url: string }>) {
    const { answer_image_url } = job.data;

    try {
      // 데이터 서버 주소
      const response = await firstValueFrom(
        this.httpService.post('http://data-server-host/data/api/answer/ocr', {
          answer_image_url,
        }),
      );
      const answerConvert = response.data.answer_convert;

      return { answer_convert: answerConvert };
    } catch (error) {
      console.error('OCR 데이터서버 요청 실패:', error.message);
    }
  }
}
