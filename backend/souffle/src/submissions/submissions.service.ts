import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/entities/user.entity';
import { Problem } from '../problems/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FileService } from 'src/files/files.service';
import { OcrService } from 'src/ocr/ocr.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { AnalysisService } from 'src/analyses/analyses.service';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(SubmissionStep)
    private submissionStepRepository: Repository<SubmissionStep>,
    private fileService: FileService,
    private ocrService: OcrService,
    private analysisService: AnalysisService,
  ) {}

  // 풀이 데이터 전송 API(FE-BE)
  async createSubmission(
    submissionDto: CreateSubmissionDto,
    files: Express.Multer.File[],
  ) {
    // 유저조회 - 현재는 인증 로직 없으므로 직접 할당
    const user = await this.userRepository.findOneBy({
      id: submissionDto.user_id,
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 문제 조회
    const problem = await this.problemRepository.findOneBy({
      id: submissionDto.problem_id,
    });
    if (!problem) throw new NotFoundException('문제를 찾을 수 없습니다.');

    // 제출 엔티티 생성
    const submission = this.submissionRepository.create({
      user,
      problem,
      totalSolveTime: submissionDto.total_solve_time,
      understandTime: submissionDto.understand_time,
      solveTime: submissionDto.solve_time,
      reviewTime: submissionDto.review_time,
    });
    const savedSubmission = await this.submissionRepository.save(submission);

    // 파일명-URL 매핑
    const fileMap = new Map();
    for (const file of files) {
      const url = await this.fileService.uploadFile(
        file,
        user.id,
        problem.id,
        savedSubmission.id,
      );
      fileMap.set(file.originalname, url);
    }

    // 정답 이미지 url
    const answerFileName = JSON.parse(submissionDto.answer).file_name;
    savedSubmission.answerImageUrl = fileMap.get(answerFileName);
    await this.submissionRepository.save(savedSubmission);

    // 풀이 단계 저장(form-data는 수동 매핑)
    const steps: Array<{
      step_number: number;
      step_time: number;
      file_name: string;
    }> = JSON.parse(submissionDto.steps);
    for (const step of steps) {
      const stepEntity = this.submissionStepRepository.create({
        submission: savedSubmission,
        stepTime: step.step_time,
        stepNumber: step.step_number,
        fileName: step.file_name,
        stepImageUrl: fileMap.get(step.file_name),
      });
      await this.submissionStepRepository.save(stepEntity);
    }

    // 풀이분석 비동기 큐 등록
    try {
      await this.analysisService.addAnalysisJob({
        submission_id: savedSubmission.id,
        problem_id: problem.id,
        answer_image_url: savedSubmission.answerImageUrl,
        steps: steps.map((step) => ({
          step_number: step.step_number,
          step_time: step.step_time,
          step_image_url: fileMap.get(step.file_name),
        })),
        total_solve_time: submissionDto.total_solve_time,
        understand_time: submissionDto.understand_time,
        solve_time: submissionDto.solve_time,
        review_time: submissionDto.review_time,
      });
    } catch (error) {
      console.error('풀이분석 큐 등록 실패:', error.message);
    }

    // 동기 OCR 처리
    try {
      const answerConvert = await this.ocrService.convertOcr(
        savedSubmission.answerImageUrl,
      );
      savedSubmission.answerConvert = answerConvert;
      savedSubmission.isCorrect = answerConvert === problem.answer;
    } catch (error) {
      console.error('OCR 변환 실패로 채점 생략');
      savedSubmission.isCorrect = null;
    }
    await this.submissionRepository.save(savedSubmission);
    // // OCR 변환 요청 큐 등록
    // await this.ocrService.addOcrJob({
    //   answer_image_url: savedSubmission.answerImageUrl,
    //   submission_id: savedSubmission.id,
    //   problem_answer: problem.answer,
    // });

    // 문제 통계 갱신
    await this.updateProblemStatistics(problem.id);
    const updatedProblem = await this.problemRepository.findOneBy({
      id: problem.id,
    });
    if (!updatedProblem) {
      throw new NotFoundException('문제 정보를 찾을 수 없습니다.');
    }

    return {
      submissionId: savedSubmission.id,
      is_correct: submission.isCorrect,
      avg_accuracy: updatedProblem.avgAccuracy,
      avg_total_solve_time: updatedProblem.avgTotalSolveTime,
      avg_understand_time: updatedProblem.avgUnderstandTime,
      avg_solve_time: updatedProblem.avgSolveTime,
      avg_review_time: updatedProblem.avgReviewTime,
    };
  }

  // 문제 통계 갱신 로직
  private async updateProblemStatistics(problemId: number) {
    // 해당 문제의 모든 제출 내역
    const submissions = await this.submissionRepository.find({
      where: { problem: { id: problemId } },
    });
    if (submissions.length === 0) return;

    // 평균 정답률 계산
    const filtered = submissions.filter(
      (s) => s.isCorrect !== null && s.isCorrect !== undefined,
    );
    const correctCount = filtered.filter((s) => s.isCorrect).length;
    const avgAccuracy =
      filtered.length > 0
        ? Math.round((correctCount / filtered.length) * 1000) / 10
        : 0;

    // null 제외 후 평균 계산
    const totalSolveTimes = submissions
      .map((s) => s.totalSolveTime)
      .filter((t) => t !== null);
    const understandTimes = submissions
      .map((s) => s.understandTime)
      .filter((t) => t !== null);
    const solveTimes = submissions
      .map((s) => s.solveTime)
      .filter((t) => t !== null);
    const reviewTimes = submissions
      .map((s) => s.reviewTime)
      .filter((t) => t !== null);

    const avgTotalSolveTime =
      totalSolveTimes.length > 0
        ? Math.round(
            totalSolveTimes.reduce((a, b) => a + b, 0) / totalSolveTimes.length,
          )
        : 0;

    const avgUnderstandTime =
      understandTimes.length > 0
        ? Math.round(
            understandTimes.reduce((a, b) => a + b, 0) / understandTimes.length,
          )
        : 0;

    const avgSolveTime =
      solveTimes.length > 0
        ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length)
        : 0;

    const avgReviewTime =
      reviewTimes.length > 0
        ? Math.round(
            reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length,
          )
        : 0;

    // 문제 엔티티 업데이트
    await this.problemRepository.update(problemId, {
      avgAccuracy,
      avgTotalSolveTime,
      avgUnderstandTime,
      avgSolveTime,
      avgReviewTime,
    });
  }

  // 풀이 분석 조회 요청 API(FE-BE)
  async getSubmissionAnalysis(submissionId: number) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['submissionSteps'],
    });
    if (!submission) throw new NotFoundException('제출을 찾을 수 없습니다.');
    // API 처리 상태
    let status: 'processing' | 'completed' | 'failed' = 'processing';
    if (submission.analysisFailed) {
      status = 'failed';
    } else if (submission.aiAnalysis && submission.weakness) {
      status = 'completed';
    }

    return {
      submissionId: submission.id,
      steps: submission.submissionSteps.map((step) => ({
        step_number: step.stepNumber,
        step_image_url: step.stepImageUrl,
        step_time: step.stepTime,
        step_valid: step.isValid,
      })),
      ai_analysis: submission.aiAnalysis,
      weakness: submission.weakness,
      status,
    };
  }
}
