import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport } from 'src/users/entities/user-report.entity';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(UserReport)
    private userReportRepository: Repository<UserReport>,
    private readonly httpService: HttpService,
  ) {}

  async createReport(userId: number, scores: any) {
    const { data } = await this.httpService.axiosRef.post(
      'http://data:8000/data/api/v1/report/latest',
      { scores },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const { aiDiagnosis, studyPlan } = data;
    const report = this.userReportRepository.create({
      user: { id: userId },
      aiDiagnosis,
      studyPlan,
    });
    const saved = await this.userReportRepository.save(report);

    return { report_id: saved.id };
  }
}
