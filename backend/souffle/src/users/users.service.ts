import { Injectable } from '@nestjs/common';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuthentication } from './entities/user-authentication.entity';
import { UserReport } from './entities/user-report.entity';
import { UserScoreStat } from './entities/user-score-stat.entity';
import { Between } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAuthentication)
    private userAuthenticationRepository: Repository<UserAuthentication>,
    @InjectRepository(UserCategoryProgress)
    private userCategoryRepository: Repository<UserCategoryProgress>,
    @InjectRepository(UserReport)
    private userReportRepository: Repository<UserReport>,
    @InjectRepository(UserScoreStat)
    private userScoreStatRepository: Repository<UserScoreStat>,
  ) {}

  // 이메일로 유저 찾기
  async findUserByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    const userAuth = await this.userAuthenticationRepository.findOne({
      where: { provider, providerId },
      relations: ['user'],
    });
    return userAuth ? userAuth.user : null;
  }

  // 닉네임 중복 체크 및 랜덤 문자열 추가
  async generateUniqueNickname(baseNickname: string): Promise<string> {
    let nickname = baseNickname;
    let exists = await this.userRepository.findOne({ where: { nickname } });
    while (exists) {
      // 랜덤 4자리 숫자 추가
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      nickname = `${baseNickname}${randomNum}`;
      exists = await this.userRepository.findOne({ where: { nickname } });
    }
    return nickname;
  }

  // 소셜 로그인 시 유저 없으면 생성
  async create(userInfo: Partial<User>): Promise<User> {
    const baseNickname =
      userInfo.nickname || `User${Math.floor(Math.random() * 1000)}`;
    const nickname = await this.generateUniqueNickname(baseNickname);

    const user = this.userRepository.create({
      ...userInfo,
      nickname,
    });
    return this.userRepository.save(user);
  }

  // 유저 통계 정보
  async getUserCategoryStats(userId: number, categoryId: number) {
    const progress = await this.userCategoryRepository.findOne({
      where: { userId, categoryId },
    });

    if (!progress) {
      // 유저 통계가 없는 경우 기본값 반환
      return {
        accuracy: null,
        progress_rate: null,
        solve_time: null,
        concept_rate: null,
        understanding: null,
      };
    }

    return {
      accuracy: progress.testAccuracy,
      progress_rate: progress.progressRate,
      solve_time: progress.solveTime,
    };
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  // 최신 리포트 조회 API
  async getLatestUserReport(userId: number) {
    const latest = await this.userReportRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (!latest) return null;
    return {
      ai_diagnosis: latest.aiDiagnosis,
      study_plan: latest.studyPlan,
      date: latest.createdAt.toISOString().slice(0, 10),
    };
  }

  // 유저 점수 지표 조회 API
  async getUserScoreStats(userId: number) {
    // 오늘 점수
    const todayStat = await this.userScoreStatRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 어제 점수
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);
    const yesterdayStat = await this.userScoreStatRepository.findOne({
      where: {
        userId,
        createdAt: Between(yesterdayStart, yesterdayEnd),
      },
      order: { createdAt: 'DESC' },
    });

    return {
      score_stats: todayStat ?? {},
      previous_stats: yesterdayStat ?? {},
    };
  }
}
