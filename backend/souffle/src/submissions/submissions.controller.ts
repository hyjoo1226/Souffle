import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  Param,
  ParseIntPipe,
  Body,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('submission')
@Controller('api/v1/submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: '풀이 데이터 전송' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'integer', example: 1 },
        problem_id: { type: 'integer', example: 2 },
        answer: { type: 'string', example: '{"file_name":"answer.jpg"}' },
        steps: {
          type: 'string',
          example: '[{"step_number":1,"file_name":"step01.jpg"}]',
        },
        total_solve_time: { type: 'integer', example: 120 },
        understand_time: { type: 'integer', example: 30 },
        solve_time: { type: 'integer', example: 60 },
        review_time: { type: 'integer', example: 30 },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: '풀이 이미지 파일들',
        },
      },
      required: [
        'user_id',
        'problem_id',
        'answer',
        'steps',
        'total_solve_time',
        'understand_time',
        'solve_time',
        'review_time',
        'files',
      ],
    },
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ status: 201, description: '제출 성공' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청(파라미터 누락/형식 오류)',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자, 문제' })
  @ApiResponse({ status: 413, description: '파일 용량 초과' })
  @ApiResponse({ status: 415, description: '지원하지 않는 파일 형식' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async createSubmission(
    @Body() submissionDto: CreateSubmissionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.submissionService.createSubmission(submissionDto, files);
  }

  @Get(':submissionId')
  @ApiOperation({ summary: '풀이 분석 조회' })
  @ApiResponse({
    status: 200,
    description: '풀이 분석 결과',
    schema: {
      example: {
        submissionId: 1,
        steps: [{ step_number: 1, step_valid: true }],
        ai_analysis: '분석 결과',
        weakness: '취약점',
        status: 'completed',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 submissionId' })
  @ApiResponse({ status: 404, description: '제출을 찾을 수 없습니다.' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async getSubmissionAnalysis(@Param('submissionId', ParseIntPipe) id: number) {
    return this.submissionService.getSubmissionAnalysis(id);
  }
}
