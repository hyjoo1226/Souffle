import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OcrService {
  constructor(private readonly httpService: HttpService) {}

  // 동기 방식 OCR 정답 변환 API(BE-DATA)
  async convertOcr(answer_image_url: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://data:8000/data/api/v1/ocr/answer',
          {
            answer_image_url,
          },
          { timeout: 10_000 },
        ),
      );
      return response.data.answer_convert;
    } catch (error) {
      console.error('OCR 변환 실패:', error.message);
      throw new Error('OCR 처리 중 오류가 발생했습니다.');
    }
  }
}
