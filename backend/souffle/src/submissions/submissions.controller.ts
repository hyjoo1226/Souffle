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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('submission')
@Controller('api/v1/submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: '제출 생성' })
  @ApiResponse({ status: 201, description: '제출 성공' })
  @UseInterceptors(FilesInterceptor('files'))
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
  async getSubmissionAnalysis(@Param('submissionId', ParseIntPipe) id: number) {
    return this.submissionService.getSubmissionAnalysis(id);
  }
}
