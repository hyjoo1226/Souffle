import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/entities/user.entity';
import { Problem } from '../problems/entities/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { FileService } from 'src/files/files.service';
import { OcrService } from 'src/ocr/ocr.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { AnalysisService } from 'src/analyses/analyses.service';
import { UserProblem } from 'src/users/entities/user-problem.entity';
import { NoteFolder } from 'src/notes/entities/note-folder.entity';

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
    @InjectRepository(UserProblem)
    private userProblemRepository: Repository<UserProblem>,
    @InjectRepository(NoteFolder)
    private noteFolderRepository: Repository<NoteFolder>,
    private fileService: FileService,
    private ocrService: OcrService,
    private analysisService: AnalysisService,
  ) {}

  // 풀이 데이터 전송 API
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
    const uploadPromises = files.map((file) =>
      this.fileService.uploadFile(
        file,
        user.id,
        problem.id,
        savedSubmission.id,
      ),
    );
    const uploadedUrls = await Promise.all(uploadPromises);
    uploadedUrls.forEach((url, index) =>
      fileMap.set(files[index].originalname, url),
    );

    // 정답 이미지 url
    const answerFileName = JSON.parse(submissionDto.answer).file_name;
    savedSubmission.answerImageUrl = fileMap.get(answerFileName);
    await this.submissionRepository.save(savedSubmission);

    // 전체 수식 이미지 url
    const fullStepFileName = JSON.parse(submissionDto.full_step).file_name;
    savedSubmission.fullStepImageUrl = fileMap.get(fullStepFileName);
    await this.submissionRepository.save(savedSubmission);

    // 풀이 단계 저장(form-data는 수동 매핑)
    const steps: Array<{
      step_number: number;
      step_time: number;
      file_name: string;
    }> = JSON.parse(submissionDto.steps);
    const stepEntities = steps.map((step) =>
      this.submissionStepRepository.create({
        submission: savedSubmission,
        stepTime: step.step_time,
        stepNumber: step.step_number,
        fileName: step.file_name,
        stepImageUrl: fileMap.get(step.file_name),
      }),
    );
    await this.submissionStepRepository.insert(stepEntities);

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

    // 오답노트에 추가
    const noteFolder = await this.noteFolderRepository.findOne({
      where: {
        category: { id: problem.category.id },
        type: 2,
      },
      relations: ['category'],
    });
    if (!noteFolder) {
      throw new NotFoundException(
        '해당 카테고리의 오답노트 폴더를 찾을 수 없습니다.',
      );
    }

    // user_problem 테이블 생성/갱신
    await this.userProblemRepository.query(
      `
  INSERT INTO user_problem 
    (user_id, problem_id, try_count, correct_count, last_submission_id, wrong_note_folder_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (user_id, problem_id) 
  DO UPDATE SET
    try_count = user_problem.try_count + 1,
    correct_count = user_problem.correct_count + $4,
    last_submission_id = $5,
    wrong_note_folder_id = CASE WHEN $4 = 0 THEN $6 ELSE user_problem.wrong_note_folder_id END
  `,
      [
        submissionDto.user_id,
        submissionDto.problem_id,
        1,
        submission.isCorrect ? 1 : 0,
        savedSubmission.id,
        noteFolder.id,
      ],
    );

    // 동기 OCR 처리
    try {
      const answerConvert = await this.ocrService.convertOcr(
        savedSubmission.answerImageUrl,
      );
      savedSubmission.answerConvert = answerConvert;
      savedSubmission.isCorrect = answerConvert === problem.answer;
      await this.submissionRepository.save(savedSubmission);
    } catch (error) {
      console.error('OCR 변환 실패로 채점 생략');
      savedSubmission.isCorrect = null;
      await this.submissionRepository.save(savedSubmission);
      return this.updateStatsAndReturnResponse(problem, savedSubmission);
    }
    // // OCR 변환 요청 큐 등록
    // await this.ocrService.addOcrJob({
    //   answer_image_url: savedSubmission.answerImageUrl,
    //   submission_id: savedSubmission.id,
    //   problem_answer: problem.answer,
    // });

    // 문제 통계 갱신
    return this.updateStatsAndReturnResponse(problem, savedSubmission);
  }

  // 통계 갱신 후 리턴
  private async updateStatsAndReturnResponse(
    problem: Problem,
    savedSubmission: Submission,
  ) {
    await this.updateProblemStatistics(problem.id);
    const updatedProblem = await this.problemRepository.findOneBy({
      id: problem.id,
    });
    if (!updatedProblem)
      throw new NotFoundException('문제 정보를 찾을 수 없습니다.');

    return {
      submissionId: savedSubmission.id,
      is_correct: savedSubmission.isCorrect,
      avg_accuracy: updatedProblem.avgAccuracy,
      avg_total_solve_time: updatedProblem.avgTotalSolveTime,
      avg_understand_time: updatedProblem.avgUnderstandTime,
      avg_solve_time: updatedProblem.avgSolveTime,
      avg_review_time: updatedProblem.avgReviewTime,
    };
  }

  // 문제 통계 갱신 로직
  private async updateProblemStatistics(problemId: number) {
    const stats = await this.submissionRepository
      .createQueryBuilder('submission')
      .select([
        'AVG(CAST(CASE WHEN submission.isCorrect IS NOT NULL THEN submission.isCorrect ELSE NULL END AS integer)) * 100 AS avgAccuracy',
        'AVG(submission.totalSolveTime) AS avgTotalSolveTime',
        'AVG(submission.understandTime) AS avgUnderstandTime',
        'AVG(submission.solveTime) AS avgSolveTime',
        'AVG(submission.reviewTime) AS avgReviewTime',
      ])
      .where('submission.problemId = :problemId', { problemId })
      .getRawOne();

    await this.problemRepository.update(problemId, {
      avgAccuracy: stats.avgAccuracy
        ? Math.round(stats.avgAccuracy * 10) / 10
        : 0,
      avgTotalSolveTime: Math.round(stats.avgTotalSolveTime) || 0,
      avgUnderstandTime: Math.round(stats.avgUnderstandTime) || 0,
      avgSolveTime: Math.round(stats.avgSolveTime) || 0,
      avgReviewTime: Math.round(stats.avgReviewTime) || 0,
    });
  }

  // 풀이 분석 조회 요청 API
  async getSubmissionAnalysis(submissionId: number) {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
      relations: ['submissionSteps', 'problem'],
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
      answer_image_url: submission.answerImageUrl,
      full_step_image_url: submission.fullStepImageUrl,
      steps: submission.submissionSteps.map((step) => ({
        step_number: step.stepNumber,
        step_image_url: step.stepImageUrl,
        step_time: step.stepTime,
        step_valid: step.isValid,
        step_feedback: step.stepFeedback,
      })),
      time: {
        total_solve_time: submission.totalSolveTime,
        understand_time: submission.understandTime,
        solve_time: submission.solveTime,
        review_time: submission.reviewTime,
      },
      explanation: {
        explanation_answer: submission.problem.answer,
        explanation_description: submission.problem.explanation,
        explanation_image_url: submission.problem.explanationImageUrl,
      },
      ai_analysis: submission.aiAnalysis,
      weakness: submission.weakness,
      status,
    };
  }

  // 문제별 모든 제출id 조회 API
  async getSubmissionIds(userId: number, problemId: number): Promise<number[]> {
    const problem = await this.problemRepository.findOne({
      where: { id: problemId },
    });
    if (!problem) {
      throw new NotFoundException('문제가 존재하지 않습니다');
    }

    const submissions = await this.submissionRepository.find({
      where: { user: { id: userId }, problem: { id: problemId } },
      select: ['id'],
      order: { id: 'DESC' },
    });

    return submissions.map((submission) => submission.id);
  }
}
