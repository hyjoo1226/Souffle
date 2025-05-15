import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Get, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  // 유저 정보 조회 API
  @UseGuards(AuthGuard('jwt'))
  @Get('my-profile')
  async getMyProfile(@Req() req) {
    return req.user;
  }

  // 리포트 조회 API
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
}
