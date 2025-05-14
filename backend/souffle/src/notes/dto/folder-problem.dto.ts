import { ApiProperty } from '@nestjs/swagger';

export class FolderProblemUserDto {
  @ApiProperty({ example: 3, description: '문제 풀이 시도 수' })
  try_count: number;

  @ApiProperty({ example: 1, description: '정답 수' })
  correct_count: number;

  @ApiProperty({ example: 1001, description: '가장 최근 제출 id' })
  last_submission_id: number;
}

export class FolderProblemDto {
  @ApiProperty({ example: 101, description: '문제 ID' })
  problem_id: number;

  @ApiProperty({ example: 201, description: 'user_problem ID' })
  user_problem_id: number;

  @ApiProperty({ example: '수학1', description: '단원 이름' })
  category_name: string;

  @ApiProperty({ example: 5, description: '단원 별 문제 번호' })
  inner_no: number;

  @ApiProperty({ example: 1, description: '문제 유형' })
  problem_type: number;

  @ApiProperty({ type: FolderProblemUserDto })
  user: FolderProblemUserDto;
}
