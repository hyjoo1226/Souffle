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
// import { CreateSubmissionDto } from './dto/create-submission.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('submission')
@Controller('api/v1/submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: '풀이 데이터 전송' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', example: 1 },
        problem_id: { type: 'string', example: 1 },
        answer: { type: 'string', example: '{"file_name":"answer.jpg"}' },
        full_step: { type: 'string', example: '{"file_name":"full_step.jpg"}' },
        steps: {
          type: 'string',
          example:
            '[{"step_number":1, "step_time":10, "file_name":"step01.jpg"}]',
        },
        total_solve_time: { type: 'string', example: 120 },
        understand_time: { type: 'string', example: 30 },
        solve_time: { type: 'string', example: 60 },
        review_time: { type: 'string', example: 30 },
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
        'full_step',
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
  @ApiResponse({
    status: 201,
    description: '제출 성공',
    schema: {
      example: {
        submissionId: 1,
        is_correct: true,
        avg_accuracy: 60,
        avg_total_solve_time: 278,
        avg_understand_time: 39,
        avg_solve_time: 218,
        avg_review_time: 21,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청(파라미터 누락/형식 오류)',
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자, 문제' })
  @ApiResponse({ status: 413, description: '파일 용량 초과' })
  @ApiResponse({ status: 415, description: '지원하지 않는 파일 형식' })
  @ApiResponse({ status: 500, description: '서버 내부 오류' })
  async createSubmission(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const submissionDto = {
      user_id: parseInt(body.user_id, 10),
      problem_id: parseInt(body.problem_id, 10),
      total_solve_time: parseInt(body.total_solve_time, 10),
      understand_time: parseInt(body.understand_time, 10),
      solve_time: parseInt(body.solve_time, 10),
      review_time: parseInt(body.review_time, 10),
      answer: body.answer,
      full_step: body.full_step,
      steps: body.steps,
    };

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
        steps: [
          {
            step_number: 1,
            answer_image_url:
              'http://localhost:3000/uploads/1/1/47/1745994490102-answer.jpg',
            full_step_image_url:
              'http://localhost:3000/uploads/1/1/47/1745994490102-answer.jpg',
            step_image_url:
              'http://localhost:3000/uploads/1/1/47/1745994490105-step01.jpg',
            step_time: 15,
            step_valid: true,
          },
        ],
        time: {
          total_solve_time: 300,
          understand_time: 40,
          solve_time: 240,
          review_time: 20,
        },
        explanation: {
          explanation_answer: 3,
          explanation_description: '문제 해설',
          explanation_image_url: '문제 해설 이미지 주소',
        },
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
