import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @IsString()
  file_name: string;
}

export class CreateSubmissionDto {
  // 아직 인증로직 없으므로 userid 직접 입력
  @ApiProperty({ example: 1, description: '유저 ID' })
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @ApiProperty({ example: 1, description: '문제 ID' })
  @IsNumber()
  @Type(() => Number)
  problem_id: number;

  @ApiProperty({
    example: '{"file_name":"answer.jpg"}',
    description: '정답 이미지 파일 정보 (JSON string)',
  })
  @IsString()
  answer: string;

  @ApiProperty({
    example: '[{"step_number":1,"file_name":"step01.jpg"}]',
    description: '풀이 단계 정보 (JSON string)',
  })
  @IsString()
  steps: string;

  @ApiProperty({ example: 120, description: '총 풀이 시간(초)' })
  @Type(() => Number)
  @IsNumber()
  @Type(() => Number)
  total_solve_time: number;

  @ApiProperty({ example: 30, description: '문제 이해 시간(초)' })
  @IsNumber()
  @Type(() => Number)
  understand_time: number;

  @ApiProperty({ example: 60, description: '문제 풀이 시간(초)' })
  @IsNumber()
  @Type(() => Number)
  solve_time: number;

  @ApiProperty({ example: 30, description: '검산 시간(초)' })
  @IsNumber()
  @Type(() => Number)
  review_time: number;
}
