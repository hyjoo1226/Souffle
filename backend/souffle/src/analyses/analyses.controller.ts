import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AnalysisService } from './analyses.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Controller('data/api/v1/ocr')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analysis')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async analyze(@Body() body: CreateAnalysisDto) {
    // 비동기 큐에 분석 작업 등록
    await this.analysisService.addAnalysisJob(body);
  }
}
