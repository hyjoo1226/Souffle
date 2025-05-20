import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileService } from 'src/files/files.service';
import { OcrService } from 'src/ocr/ocr.service';
import { Submission } from './entities/submission.entity';
import { User } from 'src/users/entities/user.entity';
import { Problem } from '../problems/entities/problem.entity';
import { SubmissionStep } from './entities/submission-step.entity';
import { AnalysisService } from 'src/analyses/analyses.service';
import { UserProblem } from 'src/users/entities/user-problem.entity';
import { NoteFolder } from 'src/notes/entities/note-folder.entity';
import { UserCategoryProgress } from 'src/users/entities/user-category-progress.entity';
import { Category } from 'src/categories/entities/category.entity';
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
    @InjectRepository(UserProblem)
    private userProblemRepository: Repository<UserProblem>,
    @InjectRepository(NoteFolder)
    private noteFolderRepository: Repository<NoteFolder>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(UserCategoryProgress)
    private userCategoryProgressRepository: Repository<UserCategoryProgress>,
    private fileService: FileService,
    private ocrService: OcrService,
    private analysisService: AnalysisService,
  ) {}

  // 풀이 데이터 전송 API
  async createSubmission(
    userId,
    submissionDto: CreateSubmissionDto,
    files: Express.Multer.File[],
  ) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    // 문제 조회
    const problem = await this.problemRepository.findOne({
      where: { id: submissionDto.problem_id },
      relations: ['category'],
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
      return this.updateStatsAndReturnResponse(
        problem,
        savedSubmission,
        userId,
      );
    }

    // 해당 단원의 진도가 있는지 확인
    const progress = await this.userCategoryProgressRepository.findOne({
      where: {
        user: { id: userId },
        category: { id: problem.category.id },
      },
    });
    if (!progress) {
      await this.userCategoryProgressRepository.save({
        user: { id: userId },
        category: { id: problem.category.id },
        solveTime: 0,
        progressRate: 0.0,
        testAccuracy: 0.0,
      });
    }

    // 통계 갱신
    return this.updateStatsAndReturnResponse(problem, savedSubmission, userId);
  }

  // 통계 갱신 후 리턴
  private async updateStatsAndReturnResponse(
    problem: Problem,
    savedSubmission: Submission,
    userId: number,
  ) {
    await this.updateProblemStatistics(problem.id);
    await this.updateCategoryProgress(userId, problem.category.id);
    await this.updateCategoryStatistics(problem.category.id);
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
      avgAccuracy:
        stats.avgAccuracy !== null && !isNaN(Number(stats.avgAccuracy))
          ? Math.round(Number(stats.avgAccuracy) * 10) / 10
          : 0,
      avgTotalSolveTime:
        stats.avgTotalSolveTime !== null &&
        !isNaN(Number(stats.avgTotalSolveTime))
          ? Math.round(Number(stats.avgTotalSolveTime))
          : 0,
      avgUnderstandTime:
        stats.avgUnderstandTime !== null &&
        !isNaN(Number(stats.avgUnderstandTime))
          ? Math.round(Number(stats.avgUnderstandTime))
          : 0,
      avgSolveTime:
        stats.avgSolveTime !== null && !isNaN(Number(stats.avgSolveTime))
          ? Math.round(Number(stats.avgSolveTime))
          : 0,
      avgReviewTime:
        stats.avgReviewTime !== null && !isNaN(Number(stats.avgReviewTime))
          ? Math.round(Number(stats.avgReviewTime))
          : 0,
    });
  }

  // 해당 유저의 카테고리 통계 갱신 로직
  private async updateCategoryProgress(userId: number, categoryId: number) {
    const categorySubmissions = await this.submissionRepository.find({
      where: {
        user: { id: userId },
        problem: { category: { id: categoryId } },
      },
      relations: ['problem'],
    });

    const totalProblemsInCategory = await this.problemRepository.count({
      where: { category: { id: categoryId } },
    });
    const solvedProblems = new Set(
      categorySubmissions.map((sub) => sub.problem.id),
    ).size;
    const correctSubmissions = categorySubmissions.filter(
      (sub) => sub.isCorrect,
    ).length;
    const totalSolveTime = categorySubmissions.reduce(
      (sum, sub) => sum + (sub.totalSolveTime || 0),
      0,
    );

    let progress = await this.userCategoryProgressRepository.findOne({
      where: {
        user: { id: userId },
        category: { id: categoryId },
      },
    });
    if (!progress) {
      progress = this.userCategoryProgressRepository.create({
        user: { id: userId },
        category: { id: categoryId },
        solveTime: 0,
        progressRate: 0.0,
        testAccuracy: 0.0,
      });
    }

    progress.solveTime = totalSolveTime;
    progress.progressRate = totalProblemsInCategory
      ? Number(((solvedProblems / totalProblemsInCategory) * 100).toFixed(1))
      : 0;
    progress.testAccuracy = categorySubmissions.length
      ? Number(
          ((correctSubmissions / categorySubmissions.length) * 100).toFixed(1),
        )
      : 0;

    await this.userCategoryProgressRepository.save(progress);
  }

  // 전체 카테고리 통계 갱신
  private async updateCategoryStatistics(categoryId: number) {
    const stats = await this.submissionRepository
      .createQueryBuilder('submission')
      .select('AVG("submission"."isCorrect"::int) * 100', 'avgAccuracy')
      .innerJoin(
        'submission.problem',
        'problem',
        'problem.categoryId = :categoryId',
        { categoryId },
      )
      .getRawOne();

    const avgAccuracyValue =
      stats.avgAccuracy !== null && !isNaN(Number(stats.avgAccuracy))
        ? Number(Number(stats.avgAccuracy).toFixed(1))
        : 0;

    await this.categoryRepository.update(categoryId, {
      avgAccuracy: avgAccuracyValue,
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
        step_latex: step.latex,
        step_current_latex: step.currentLatex,
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
