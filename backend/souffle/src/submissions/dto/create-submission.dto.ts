import { IsString, IsNumber } from 'class-validator';

export class AnswerDto {
  @IsString()
  file_name: string;
}

export class CreateSubmissionDto {
  // 아직 인증로직 없으므로 userid 직접 입력
  @IsNumber()
  user_id: number;

  @IsNumber()
  problem_id: number;

  @IsString()
  answer: string;

  @IsString()
  steps: string;

  @IsNumber()
  total_solve_time: number;

  @IsNumber()
  understand_time: number;

  @IsNumber()
  solve_time: number;

  @IsNumber()
  review_time: number;
}
