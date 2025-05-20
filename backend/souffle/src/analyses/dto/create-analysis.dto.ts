import { IsInt, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class StepDto {
  @IsInt()
  step_number: number;

  @IsInt()
  step_time: number;

  @IsString()
  step_image_url: string;
}

export class CreateAnalysisDto {
  @IsInt()
  problem_id: number;

  @IsString()
  answer_image_url: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];

  @IsInt()
  total_solve_time: number;

  @IsInt()
  understand_time: number;

  @IsInt()
  solve_time: number;

  @IsInt()
  review_time: number;

  @IsInt()
  submission_id: number;
}
