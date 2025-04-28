import { Module } from '@nestjs/common';
import { ProblemController } from './problems.controller';
import { ProblemService } from './problems.service';

@Module({
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
