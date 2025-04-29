import { Injectable } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class OcrService {
//   constructor(@InjectQueue('ocr-queue') private ocrQueue: Queue) {}

//   async addOcrJob(data: {
//     answer_image_url: string;
//     submission_id: number;
//     problem_answer: string;
//   }) {
//     // 큐에 작업 추가
//     const job = await this.ocrQueue.add('ocr', { data });
//     return { jobId: job.id };
//   }
// }
@Injectable()
export class OcrService {
  constructor(private readonly httpService: HttpService) {}

  // 동기 방식 OCR 정답 변환 API(BE-DATA)
  async convertOcr(answer_image_url: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        // 데이터 서버
        this.httpService.post('http://data-server-host/data/api/answer/ocr', {
          answer_image_url,
        }),
      );
      return response.data.answer_convert;
    } catch (error) {
      console.error('OCR 변환 실패:', error.message);
      throw new Error('OCR 처리 중 오류가 발생했습니다.');
    }
  }
}
