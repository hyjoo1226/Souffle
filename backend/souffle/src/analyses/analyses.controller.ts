import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnalysisService } from './analyses.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Controller('data/api/answer')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analysis')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async analyze(@Body() body: CreateAnalysisDto) {
    // 비동기 큐에 분석 작업 등록
    await this.analysisService.addAnalysisJob(body);
    // const job = await this.analysisService.addAnalysisJob(body);
    // // 즉시 응답 (비동기 처리라면 jobId 반환)
    // return { jobId: job.id, status: 'processing' };
  }
}
