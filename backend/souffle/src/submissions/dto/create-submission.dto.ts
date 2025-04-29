import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  file_name: string;
}

export class CreateSubmissionDto {
  // 아직 인증로직 없으므로 userid 직접 입력
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @IsNumber()
  @Type(() => Number)
  problem_id: number;

  @IsString()
  answer: string;

  @IsString()
  steps: string;

  @IsNumber()
  @Type(() => Number)
  total_solve_time: number;

  @IsNumber()
  @Type(() => Number)
  understand_time: number;

  @IsNumber()
  @Type(() => Number)
  solve_time: number;

  @IsNumber()
  @Type(() => Number)
  review_time: number;
}
