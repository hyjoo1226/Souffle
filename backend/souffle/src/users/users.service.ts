import { Injectable } from '@nestjs/common';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuthentication } from './entities/user-authentication.entity';
import { UserReport } from './entities/user-report.entity';
import { UserScoreStat } from './entities/user-score-stat.entity';
import { Between } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserProblem } from './entities/user-problem.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Submission } from 'src/submissions/entities/submission.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    @InjectRepository(UserProblem)
    private userProblemRepository: Repository<UserProblem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Submission)
    private submissionRepository: Repository<Submission>,
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

    // 일주일 전 점수
    const weekAgoStart = new Date();
    weekAgoStart.setDate(weekAgoStart.getDate() - 7);
    weekAgoStart.setHours(0, 0, 0, 0);

    const weekAgoEnd = new Date();
    weekAgoEnd.setDate(weekAgoEnd.getDate() - 7);
    weekAgoEnd.setHours(23, 59, 59, 999);

    const weekAgoStat = await this.userScoreStatRepository.findOne({
      where: {
        userId,
        createdAt: Between(weekAgoStart, weekAgoEnd),
      },
      order: { createdAt: 'DESC' },
    });

    return {
      score_stats: todayStat ?? {},
      previous_stats: yesterdayStat ?? {},
      week_ago_stats: weekAgoStat ?? {},
    };
  }

  // 유저 정보 조회 API
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['authentications'],
      select: ['id', 'nickname', 'profileImage', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    const email = user.authentications?.[0]?.email ?? null;

    return {
      id: user.id,
      nickname: user.nickname,
      profile_image: user.profileImage,
      created_at: user.createdAt,
      email,
    };
  }

  // 유저 정보 수정 API
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    user.nickname = dto.nickname;
    await this.userRepository.save(user);
    return { nickname: user.nickname };
  }

  // 단원 별 분석 조회 API
  async getCategoryAnalysis(userId: number) {
    const categories = await this.categoryRepository.find();

    const results = await Promise.all(
      categories.map(async (category) => {
        const userProblems = await this.userProblemRepository
          .createQueryBuilder('up')
          .innerJoin('up.problem', 'p')
          .where('up.user_id = :userId', { userId })
          .andWhere('p.categoryId = :categoryId', { categoryId: category.id })
          .getMany();

        const total = userProblems.length;
        const correct = userProblems.filter(
          (up) => up.correct_count > 0,
        ).length;
        const solved = userProblems.filter((up) => up.try_count > 0).length;

        return {
          id: category.id,
          name: category.name,
          type: category.type,
          accuracy_rate: total ? Math.round((correct / total) * 1000) / 10 : 0,
          progress_rate: total ? Math.round((solved / total) * 1000) / 10 : 0,
        };
      }),
    );

    return { categories: results };
  }

  // 주간 학습 시간 조회 API
  async getWeeklyStudy(
    userId: number,
    startDateTime: Date,
    endDateTime: Date,
    startDateStr: string,
    endDateStr: string,
  ) {
    const submissions = await this.submissionRepository.find({
      where: {
        user: { id: userId },
        createdAt: Between(startDateTime, endDateTime),
      },
    });

    const dateMap = new Map<string, number>();
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = this.addDays(startDateStr, i);
      dates.push(currentDate);
      dateMap.set(currentDate, 0);
    }

    for (const submission of submissions) {
      const submissionDate = submission.createdAt.toISOString().split('T')[0];
      if (dateMap.has(submissionDate)) {
        dateMap.set(
          submissionDate,
          dateMap.get(submissionDate)! + (submission.totalSolveTime || 0),
        );
      }
    }

    const daily_records = dates.map((date) => ({
      date,
      weekday: this.getWeekday(date),
      total_solve_time: dateMap.get(date) || 0,
    }));

    return {
      week_start: startDateStr,
      week_end: endDateStr,
      daily_records,
    };
  }
  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
  // 요일 (월요일: 0, 일요일: 6)
  private getWeekday(dateStr: string): number {
    const date = new Date(dateStr);
    return (date.getDay() + 6) % 7;
  }

  // 문제 풀이 현황 조회 API
  async getProblemSolvingHistory(
    userId: number,
    startDateTime: Date,
    endDateTime: Date,
    year: number,
  ) {
    const submissions = await this.submissionRepository.find({
      where: {
        user: { id: userId },
        createdAt: Between(startDateTime, endDateTime),
      },
    });

    const dateMap = new Map<string, number>();
    const dates: string[] = [];
    const daysInYear = this.isLeapYear(year) ? 366 : 365;
    for (let i = 0; i < daysInYear; i++) {
      const currentDate = this.addDays(`${year}-01-01`, i);
      dates.push(currentDate);
      dateMap.set(currentDate, 0);
    }

    for (const submission of submissions) {
      const submissionDate = submission.createdAt.toISOString().split('T')[0];
      if (dateMap.has(submissionDate)) {
        dateMap.set(submissionDate, dateMap.get(submissionDate)! + 1);
      }
    }

    const daily_records = dates.map((date) => ({
      date,
      problem_count: dateMap.get(date) || 0,
    }));

    return {
      year,
      daily_records,
    };
  }
  // 윤년 확인
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
}
