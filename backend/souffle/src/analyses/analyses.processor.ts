import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from 'src/submissions/entities/submission.entity';
import { SubmissionStep } from 'src/submissions/entities/submission-step.entity';

interface AnalysisJobData {
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
}

@Processor('analysis-queue')
export class AnalysisProcessor {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(SubmissionStep)
    private readonly submissionStepRepository: Repository<SubmissionStep>,
  ) {}

  // 풀이 분석 API (BE-DATA)
  @Process('analyze')
  async handleAnalysis(job: Job<AnalysisJobData>) {
    const { submission_id, ...requestData } = job.data;
    try {
      // 데이터서버 분석 요청
      const response = await firstValueFrom(
        this.httpService.post(
          'http://data:8000/data/api/v1/ocr/analysis',
          requestData,
        ),
      );
      // 결과 저장
      for (const step of response.data.steps) {
        await this.submissionStepRepository.update(
          {
            submission: { id: submission_id },
            stepNumber: step.step_number,
          },
          {
            isValid: step.step_valid,
            stepFeedback: step.step_feedback,
            latex: step.latex,
            currentLatex: step.current_latex,
          },
        );
      }

      await this.submissionRepository.update(submission_id, {
        aiAnalysis: response.data.ai_analysis,
        weakness: response.data.weakness,
      });

      return response.data;
    } catch (error) {
      console.error(
        `분석 실패 (submission_id: ${submission_id}):`,
        error.message,
      );
      throw error;
    }
  }

  // 큐 처리 실패 로직
  @OnQueueFailed()
  async handleFailed(job: Job<AnalysisJobData>, error: Error) {
    const { submission_id } = job.data;
    await this.submissionRepository.update(submission_id, {
      analysisFailed: true,
    });
    console.error(
      `분석 작업 최종 실패 (submission_id: ${submission_id}):`,
      error.message,
    );
  }
}
