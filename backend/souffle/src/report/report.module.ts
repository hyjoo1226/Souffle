import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { UserReport } from 'src/users/entities/user-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserReport])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
