import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport } from 'src/users/entities/user-report.entity';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from 'src/users/entities/user.entity';
import { UserScoreStat } from 'src/users/entities/user-score-stat.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(UserScoreStat)
    private userScoreStatRepository: Repository<UserScoreStat>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserReport)
    private userReportRepository: Repository<UserReport>,
    private readonly httpService: HttpService,
  ) {}

  // 자정마다 모든 유저 리포트 생성
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledReportGeneration() {
    const allUsers = await this.userRepository.find();

    for (const user of allUsers) {
      const latestScore = await this.userScoreStatRepository.findOne({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
      });

      if (!latestScore) {
        console.log(`User ${user.id} has no score data`);
        continue;
      }

      await this.createReport(user.id, {
        correct_score: latestScore.correctScore,
        participation_score: latestScore.participationScore,
        speed_score: latestScore.speedScore,
        review_score: latestScore.reviewScore,
        sincerity_score: latestScore.sincerityScore,
        reflection_score: latestScore.reflectionScore,
      });
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
