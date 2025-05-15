import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Get, Req, Query } from '@nestjs/common';
import { UserService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  // 유저 정보 조회 API
  @ApiOperation({ summary: '유저 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '유저 정보',
    schema: {
      example: {
        id: 1,
        nickname: '테스트유저',
        profile_image: null,
        created_at: '2025-05-14T06:28:04.496Z',
        email: null,
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('my-profile')
  async getMyProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getProfile(userId);
  }
  // @UseGuards(AuthGuard('jwt'))
  // @Get('my-profile')
  // async getMyProfile(@Req() req) {
  //   return req.user;
  // }

  // 최신 리포트 조회 API
  @ApiOperation({ summary: '리포트 최신 조회' })
  @ApiResponse({
    status: 200,
    description: '리포트 최신 정보',
    schema: {
      example: {
        ai_diagnosis: 'AI종합진단',
        study_plan: '학습플랜',
        date: '2025-05-15',
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('report/latest')
  async getLatestReport(@Req() req) {
    const userId = req.user.id;

    return this.usersService.getLatestUserReport(userId);
  }

  // 유저 점수 지표 조회 API
  @ApiOperation({ summary: '유저 점수 지표 조회' })
  @ApiResponse({
    status: 200,
    description: '유저 점수 지표(오늘, 어제, 일주일 전)',
    schema: {
      example: {
        score_stats: {
          correct_score: 85.5,
          participation_score: 70.0,
          speed_score: 60.0,
          review_score: 80.0,
          sincerity_score: 90.0,
          reflection_score: 75.0,
        },
        previous_stats: {
          correct_score: 80.0,
          participation_score: 65.0,
          speed_score: 55.0,
          review_score: 75.0,
          sincerity_score: 85.0,
          reflection_score: 70.0,
        },
        week_ago_stats: {
          correct_score: 80.0,
          participation_score: 65.0,
          speed_score: 55.0,
          review_score: 75.0,
          sincerity_score: 85.0,
          reflection_score: 70.0,
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('statistic/score-stats')
  async getUserScoreStats(@Req() req) {
    const userId = req.user.id;

    return this.usersService.getUserScoreStats(userId);
  }

  // 단원 별 분석 조회 API
  @ApiOperation({ summary: '단원 별 분석 조회' })
  @ApiResponse({
    status: 200,
    description: '단원 별 분석 데이터',
    schema: {
      example: {
        categories: [
          {
            id: 1,
            name: '지수와 로그',
            type: 2,
            accuracy_rate: 85.5,
            progress_rate: 70.0,
          },
          // ...다른 단원 데이터
        ],
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('statistic/category-analysis')
  async getCategoryAnalysis(@Req() req) {
    const userId = req.user.id;

    return this.usersService.getCategoryAnalysis(userId);
  }

  // 주간 학습 시간 조회 API
  @ApiOperation({ summary: '주간 학습 시간 조회' })
  @ApiResponse({
    status: 200,
    description: '주간 학습 시간 데이터',
    schema: {
      example: {
        week_start: '2025-05-09',
        week_end: '2025-05-15',
        daily_records: [
          {
            date: '2025-05-09',
            weekday: 4,
            total_solve_time: 0,
          },
          // ...
        ],
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('statistic/weekly-study')
  async getWeeklyStudy(@Req() req, @Query('date') date: string) {
    const endDateStr = date;
    const startDateStr = this.subtractDays(endDateStr, 6);
    const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDateTime = new Date(`${endDateStr}T23:59:59.999Z`);

    const userId = req.user.id;

    return this.usersService.getWeeklyStudy(
      userId,
      startDateTime,
      endDateTime,
      startDateStr,
      endDateStr,
    );
  }
  private subtractDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  // 문제 풀이 현황 조회 API
  @ApiOperation({ summary: '문제 풀이 현황 조회' })
  @ApiResponse({
    status: 200,
    description: '연도별 문제 풀이 현황',
    schema: {
      example: {
        year: 2025,
        daily_records: [
          { date: '2025-01-01', problem_count: 5 },
          { date: '2025-01-02', problem_count: 3 },
          // ... 365일 데이터
        ],
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('statistic/heatmap')
  async getProblemSolvingHistory(@Req() req, @Query('year') year: string) {
    const startDateStr = `${year}-01-01`;
    const endDateStr = `${year}-12-31`;
    const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDateTime = new Date(`${endDateStr}T23:59:59.999Z`);

    const userId = req.user.id;

    return this.usersService.getProblemSolvingHistory(
      userId,
      startDateTime,
      endDateTime,
      parseInt(year),
    );
  }
}
