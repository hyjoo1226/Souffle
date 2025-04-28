import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from 'src/submissions/entities/submission.entity';

@Processor('ocr-queue')
export class OcrProcessor {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
  ) {}

  @Process('ocr')
  async handleOcr(
    job: Job<{
      answer_image_url: string;
      submission_id: number;
      problem_answer: string;
    }>,
  ) {
    const { answer_image_url, submission_id, problem_answer } = job.data;

    try {
      // OCR 요청
      const response = await firstValueFrom(
        // 데이터 서버 주소
        this.httpService.post('http://data-server-host/data/api/answer/ocr', {
          answer_image_url,
        }),
      );

      if (!response.data?.answer_convert) {
        throw new Error('Invalid OCR response format');
      }
      // 변환값 채점 및 저장
      const answerConvert = response.data.answer_convert;
      const isCorrect = answerConvert === problem_answer;
      await this.submissionRepository.update(submission_id, {
        answerConvert,
        isCorrect,
      });

      return { answer_convert: answerConvert, is_correct: isCorrect };
    } catch (error) {
      console.error(
        `OCR 처리 실패 (submission_id: ${submission_id}):`,
        error.message,
      );
      throw error;
    }
  }
}
