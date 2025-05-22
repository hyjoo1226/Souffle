import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/users/entities/user.entity';
import { UserReport } from 'src/users/entities/user-report.entity';
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
      .select('DISTINCT s."problemId"', 'problemId')
      .where('s."userId" = :userId', { userId })
      .andWhere('s."isCorrect" = true')
      .andWhere('s."createdAt" >= :oneWeekAgo', { oneWeekAgo })
      .getRawMany();

    const totalProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .select('DISTINCT s."problemId"', 'problemId')
      .where('s."userId" = :userId', { userId })
      .andWhere('s."createdAt" >= :oneWeekAgo', { oneWeekAgo })
      .getRawMany();

    const correctScore = totalProblems.length
      ? (correctProblems.length / totalProblems.length) * 100
      : 0;

    // Participation Score
    const participationScore = Math.min(totalProblems.length * 2, 100);

    // Speed Score
    const speedProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .innerJoin('problems', 'p', 's."problemId" = p."id"')
      .select('s."id"', 'submissionId')
      .where('s."userId" = :userId', { userId })
      .andWhere('s."isCorrect" = true')
      .andWhere('s."solveTime" < p."avgSolveTime"')
      .andWhere('s."createdAt" >= :oneWeekAgo', { oneWeekAgo })
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
            .select('MIN(fs."id")', 'firstId')
            .addSelect('fs."problemId"', 'problemId')
            .where('fs."userId" = :userId')
            .andWhere('fs."createdAt" >= :oneWeekAgo')
            .groupBy('fs."problemId"'),
        'first',
        's."id" != first."firstId" AND s."problemId" = first."problemId"',
      )
      .setParameter('userId', userId)
      .setParameter('oneWeekAgo', oneWeekAgo)
      .where('s."userId" = :userId', { userId })
      .andWhere('s."createdAt" >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const correctResubmissions = await this.submissionRepository
      .createQueryBuilder('s')
      .innerJoin(
        (qb) =>
          qb
            .from(Submission, 'fs')
            .select('MIN(fs."id")', 'firstId')
            .groupBy('fs."problemId"'),
        'first',
        's."id" != first."firstId"',
      )
      .where('s."userId" = :userId', { userId })
      .andWhere('s."isCorrect" = true')
      .andWhere('s."createdAt" >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const reviewScore = resubmissions
      ? (correctResubmissions / resubmissions) * 100
      : 0;

    // Sincerity Score
    const notedProblems = await this.userProblemRepository
      .createQueryBuilder('up')
      .innerJoin('up.noteContents', 'nc')
      .where('up."user_id" = :userId', { userId })
      .andWhere('nc."createdAt" >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    const sincerityScore = totalProblems.length
      ? (notedProblems / totalProblems.length) * 100
      : 0;

    // Reflection Score
    const retriedProblems = await this.submissionRepository
      .createQueryBuilder('s')
      .select('s."problemId"', 'problemId')
      .where('s."userId" = :userId', { userId })
      .andWhere('s."createdAt" >= :oneWeekAgo', { oneWeekAgo })
      .groupBy('s."problemId"')
      .having('COUNT(s."problemId") > 1')
      .getCount();

    const reflectionScore =
      retriedProblems >= 20 ? 100 : Math.round((retriedProblems / 20) * 100);

    return {
      correct_score: correctScore ?? 0,
      participation_score: participationScore ?? 0,
      speed_score: speedScore ?? 0,
      review_score: reviewScore ?? 0,
      sincerity_score: sincerityScore ?? 0,
      reflection_score: reflectionScore ?? 0,
    };
  }

  // 자정마다 모든 유저 리포트 생성
//  @Cron('0 15 * * *')
  @Cron('45 0 * * *')
  async scheduledReportGeneration() {
    const allUsers = await this.userRepository.find();

    for (const user of allUsers) {
      const scores = await this.calculateUserScores(user.id);

      // 유저 지표 저장
      await this.userScoreStatRepository.save({
        userId: user.id,
        correctScore: scores.correct_score ?? 0,
        participationScore: scores.participation_score ?? 0,
        speedScore: scores.speed_score ?? 0,
        reviewScore: scores.review_score ?? 0,
        sincerityScore: scores.sincerity_score ?? 0,
        reflectionScore: scores.reflection_score ?? 0,
      });

      // 리포트 생성
      await this.createReport(user.id, scores);
    }
  }

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
