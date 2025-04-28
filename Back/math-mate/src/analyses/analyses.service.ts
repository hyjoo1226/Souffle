import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AnalysisService {
  constructor(@InjectQueue('analysis-queue') private analysisQueue: Queue) {}

  async addAnalysisJob(data: {
    submission_id: number;
    problem_id: number;
    answer_image_url: string;
    steps: Array<{ step_number: number; step_image_url: string }>;
    total_solve_time: number;
    understand_time: number;
    solve_time: number;
    review_time: number;
  }) {
    // 큐에 분석 작업 추가
    return await this.analysisQueue.add('analyze', data);
  }
}
