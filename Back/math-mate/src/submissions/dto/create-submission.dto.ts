import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StepDto {
  @IsNumber()
  step_number: number;

  file_name: string;
}

export class AnswerDto {
  file_name: string;
}

export class CreateSubmissionDto {
  // 아직 인증로직 없으므로 userid 직접 입력
  @IsNumber()
  user_id: number;

  @IsNumber()
  problem_id: number;

  @ValidateNested()
  @Type(() => AnswerDto)
  answer: AnswerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];

  @IsNumber()
  total_solve_time: number;

  @IsNumber()
  understand_time: number;

  @IsNumber()
  solve_time: number;

  @IsNumber()
  review_time: number;
}
