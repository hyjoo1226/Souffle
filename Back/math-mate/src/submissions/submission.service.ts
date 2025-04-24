import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { Problem } from '../problems/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FileService } from 'src/files/file.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(SubmissionStep)
    private submissionStepRepository: Repository<SubmissionStep>,
    private fileService: FileService,
  ) {}

  async createSubmission(
    submissionDto: CreateSubmissionDto,
    files: Express.Multer.File[],
  ) {
    // 파일명-URL 맵핑
    const fileMap = new Map();
    for (const file of files) {
      const url = await this.fileService.uploadFile(file);
      fileMap.set(file.originalname, url);
    }

    // 문제 조회
    const problem = await this.problemRepository.findOneBy({
      id: submissionDto.problem_id,
    });
    if (!problem) throw new NotFoundException('문제를 찾을 수 없습니다.');

    // 제출 엔티티 생성
    const submission = this.submissionRepository.create({
      problem,
      // user: 현재 로그인 사용자 정보 필요
      totalSolveTime: submissionDto.total_solve_time,
      understandTime: submissionDto.understand_time,
      solveTime: submissionDto.solve_time,
      reviewTime: submissionDto.review_time,
      answerImageUrl: fileMap.get(submissionDto.answer.file_name),
    });
    const savedSubmission = await this.submissionRepository.save(submission);

    // 풀이 단계 저장
    for (const step of submissionDto.steps) {
      const stepEntity = this.submissionStepRepository.create({
        submission: savedSubmission,
        stepNumber: step.step_number,
        stepImageUrl: fileMap.get(step.file_name),
      });
      await this.submissionStepRepository.save(stepEntity);
    }

    // 채점 로직 (예시: 정답 문자열 단순 비교)
    const isCorrect = await this.checkAnswer(savedSubmission, problem);

    savedSubmission.isCorrect = isCorrect;
    await this.submissionRepository.save(savedSubmission);

    // 통계 갱신 (예시)
    await this.updateProblemStatistics(problem.id);

    // 응답 구조
    return {
      submissionId: savedSubmission.id,
      is_correct: isCorrect ? 1 : 0,
      avg_accuracy: problem.avgAccuracy,
      avg_solve_time: problem.avgTotalSolveTime,
    };
  }

  private async checkAnswer(
    submission: Submission,
    problem: Problem,
  ): Promise<boolean> {
    // 실제 채점 로직 구현 (예: 제출 이미지 OCR → 텍스트 변환 후 비교)
    return true; // 임시
  }

  private async updateProblemStatistics(problemId: number) {
    // 문제별 평균 정답률, 평균 풀이 시간 갱신 로직
  }
}
