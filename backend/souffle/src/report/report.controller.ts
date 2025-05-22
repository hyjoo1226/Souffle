import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@Controller('data/api/v1/report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({ summary: '리포트 생성 요청' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scores: {
          type: 'object',
          properties: {
            correct_score: { type: 'number', example: 85.5 },
            participation_score: { type: 'number', example: 92.0 },
            speed_score: { type: 'number', example: 78.0 },
            review_score: { type: 'number', example: 80.5 },
            sincerity_score: { type: 'number', example: 95.0 },
            reflection_score: { type: 'number', example: 85.0 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '리포트 생성 성공',
    schema: {
      example: {
        report_id: 123,
      },
    },
  })
  @Post('latest')
  @UseGuards(AuthGuard('jwt'))
  async createLatestReport(
    @Req() req,
    @Body()
    body: {
      scores: {
        correct_score: number;
        participation_score: number;
        speed_score: number;
        review_score: number;
        sincerity_score: number;
        reflection_score: number;
      };
    },
  ) {
    const userId = req.user.id;
    return this.reportService.createReport(userId, body.scores);
  }
}
