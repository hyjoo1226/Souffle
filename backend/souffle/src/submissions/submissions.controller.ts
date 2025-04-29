import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  Param,
  Body,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('api/v1/submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async createSubmission(
    @Body() submissionDto: CreateSubmissionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.submissionService.createSubmission(submissionDto, files);
  }

  @Get(':submissionId')
  async getSubmissionAnalysis(@Param('submissionId') id: number) {
    return this.submissionService.getSubmissionAnalysis(id);
  }
}
