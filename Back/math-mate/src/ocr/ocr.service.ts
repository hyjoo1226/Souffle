import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class OcrService {
  constructor(@InjectQueue('ocr-queue') private ocrQueue: Queue) {}

  async addOcrJob(data: {
    answer_image_url: string;
    submission_id: number;
    problem_answer: string;
  }) {
    // 큐에 작업 추가
    const job = await this.ocrQueue.add('ocr', { data });
    return { jobId: job.id };
  }
}
