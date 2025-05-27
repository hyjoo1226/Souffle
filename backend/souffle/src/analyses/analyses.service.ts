import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AnalysisService {
  constructor(@InjectQueue('analysis-queue') private analysisQueue: Queue) {}

  async addAnalysisJob(data: {
    submission_id: number;
    problem_id: number;
    answer_image_url: string;
    steps: Array<{
      step_number: number;
      step_time: number;
      step_image_url: string;
    }>;
    total_solve_time: number;
    understand_time: number;
    solve_time: number;
    review_time: number;
  }) {
    // 큐에 분석 작업 추가
    try {
    return await this.analysisQueue.add('analyze', data);
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Redis')) {
      // Redis 연결 실패
      throw new ServiceUnavailableException('분석 서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
    }
    throw error;
  }
  }
}
