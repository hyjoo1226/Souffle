import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport } from 'src/users/entities/user-report.entity';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/users/entities/user.entity';
import { UserScoreStat } from 'src/users/entities/user-score-stat.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { UserProblem } from 'src/users/entities/user-problem.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(UserScoreStat)
    private userScoreStatRepository: Repository<UserScoreStat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserReport)
    private userReportRepository: Repository<UserReport>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
    @InjectRepository(UserProblem)
    private userProblemRepository: Repository<UserProblem>,
    private readonly httpService: HttpService,
  ) {}

  // 유저 지표 생성
  async calculateUserScores(userId: number) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // correctScore
    const correctProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .select('DISTINCT s.problem_id', 'problemId')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.is_correct = true')
      .andWhere('s.created_at >= :oneWeekAgo', { oneWeekAgo })
      .getRawMany();

    const totalProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .select('DISTINCT s.problem_id', 'problemId')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.created_at >= :oneWeekAgo', { oneWeekAgo })
      .getRawMany();

    const correctScore = totalProblems.length
      ? (correctProblems.length / totalProblems.length) * 100
      : 0;

    // Participation Score
    const participationScore = Math.min(totalProblems.length * 2, 100);

    // Speed Score
    const speedProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .innerJoin('s.problem', 'p')
      .select('s.id', 'submissionId')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.is_correct = true')
      .andWhere('s.solve_time < p.avg_solve_time')
      .andWhere('s.created_at >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const speedScore = totalProblems.length
      ? (speedProblems / totalProblems.length) * 100
      : 0;

    // Review Score
    const resubmissions = await this.submissionRepository
      .createQueryBuilder('s')
      .innerJoin(
        (qb) =>
          qb
            .subQuery()
            .from(Submission, 'fs')
            .select('MIN(fs.id)', 'firstId')
            .where('fs.user_id = :userId')
            .andWhere('fs.created_at >= :oneWeekAgo')
            .groupBy('fs.problem_id'),
        'first',
        's.id != first.firstId AND s.problem_id = first.problem_id',
      )
      .setParameter('userId', userId)
      .setParameter('oneWeekAgo', oneWeekAgo)
      .where('s.user_id = :userId', { userId })
      .andWhere('s.created_at >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const correctResubmissions = await this.submissionRepository
      .createQueryBuilder('s')
      .innerJoin(
        (qb) =>
          qb
            .from(Submission, 'fs')
            .select('MIN(fs.id)', 'firstId')
            .groupBy('fs.problemId'),
        'first',
        's.id != first.firstId',
      )
      .where('s.userId = :userId', { userId })
      .andWhere('s.isCorrect = true')
      .andWhere('s.createdAt >= :oneWeekAgo', { oneWeekAgo })
      .getCount();
    const reviewScore = resubmissions
      ? (correctResubmissions / resubmissions) * 100
      : 0;

    // Sincerity Score
    const notedProblems = await this.userProblemRepository
      .createQueryBuilder('up')
      .innerJoin('up.noteContents', 'nc')
      .where('up.user_id = :userId', { userId })
      .andWhere('nc.created_at >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const sincerityScore = totalProblems.length
      ? (notedProblems / totalProblems.length) * 100
      : 0;

    // Reflection Score
    const retriedProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .select('s.problem_id', 'problemId')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.created_at >= :oneWeekAgo', { oneWeekAgo })
      .groupBy('s.problem_id')
      .having('COUNT(s.problem_id) > 1')
      .getCount();

    const reflectionScore = totalProblems.length
      ? (retriedProblems / totalProblems.length) * 100
      : 0;

    return {
      correctScore,
      participationScore,
      speedScore,
      reviewScore,
      sincerityScore,
      reflectionScore,
    };
  }

  // 자정마다 모든 유저 리포트 생성
  @Cron('0 14 * * *')
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledReportGeneration() {
    const allUsers = await this.userRepository.find();

    for (const user of allUsers) {
      const scores = await this.calculateUserScores(user.id);

      // 유저 지표 저장
      const newScoreStat = this.userScoreStatRepository.create({
        userId: user.id,
        ...scores,
      });
      await this.userScoreStatRepository.save(newScoreStat);

      // 리포트 생성
      await this.createReport(user.id, scores);
    }
  }
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async scheduledReportGeneration() {
  //   const allUsers = await this.userRepository.find();

  //   for (const user of allUsers) {
  //     const latestScore = await this.userScoreStatRepository.findOne({
  //       where: { userId: user.id },
  //       order: { createdAt: 'DESC' },
  //     });

  //     if (!latestScore) {
  //       console.log(`User ${user.id} has no score data`);
  //       continue;
  //     }

  //     await this.createReport(user.id, {
  //       correct_score: latestScore.correctScore,
  //       participation_score: latestScore.participationScore,
  //       speed_score: latestScore.speedScore,
  //       review_score: latestScore.reviewScore,
  //       sincerity_score: latestScore.sincerityScore,
  //       reflection_score: latestScore.reflectionScore,
  //     });
  //   }
  // }

  // 리포트 생성 API(BE-DATA)
  async createReport(userId: number, scores: any) {
    const { data } = await this.httpService.axiosRef.post(
      'http://data:8000/data/api/v1/report/latest',
      { scores },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const { ai_diagnosis, study_plan } = data;
    const report = this.userReportRepository.create({
      user: { id: userId },
      aiDiagnosis: ai_diagnosis,
      studyPlan: study_plan,
    });
    const saved = await this.userReportRepository.save(report);

    return { report_id: saved.id };
  }
}
