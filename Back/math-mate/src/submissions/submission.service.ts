import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/user.entity';
import { Problem } from '../problems/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FileService } from 'src/files/file.service';
import { OcrService } from 'src/ocr/ocr.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

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
  ) {}

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

    // 동기 OCR 처리
    try {
      const answerConvert = await this.ocrService.convertOcr(
        savedSubmission.answerImageUrl,
      );
      savedSubmission.answerConvert = answerConvert;
      savedSubmission.isCorrect = answerConvert === problem.answer;
    } catch (error) {
      console.error('OCR 변환 실패로 채점 생략');
      savedSubmission.isCorrect = false;
    }
    await this.submissionRepository.save(savedSubmission);
    // // OCR 변환 요청 큐 등록
    // await this.ocrService.addOcrJob({
    //   answer_image_url: savedSubmission.answerImageUrl,
    //   submission_id: savedSubmission.id,
    //   problem_answer: problem.answer,
    // });

    // 풀이 단계 저장(form-data는 수동 매핑)
    const steps: Array<{ step_number: number; file_name: string }> = JSON.parse(
      submissionDto.steps,
    );
    for (const step of steps) {
      const stepEntity = this.submissionStepRepository.create({
        submission: savedSubmission,
        stepNumber: step.step_number,
        fileName: step.file_name,
        stepImageUrl: fileMap.get(step.file_name),
      });
      await this.submissionStepRepository.save(stepEntity);
    }

    // 문제 통계 갱신
    await this.updateProblemStatistics(problem.id);

    return {
      submissionId: savedSubmission.id,
      is_correct: submission.isCorrect,
      avg_accuracy: problem.avgAccuracy,
      avg_solve_time: problem.avgTotalSolveTime,
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
    const correctCount = submissions.filter((s) => s.isCorrect).length;
    const avgAccuracy =
      Math.round((correctCount / submissions.length) * 1000) / 10;

    // 평균 풀이시간 계산
    const totalSolveTime = submissions.reduce(
      (sum, s) => sum + (s.totalSolveTime || 0),
      0,
    );
    const avgTotalSolveTime = Math.round(totalSolveTime / submissions.length);

    // 저장
    await this.problemRepository.update(problemId, {
      avgAccuracy,
      avgTotalSolveTime,
    });
  }
}
