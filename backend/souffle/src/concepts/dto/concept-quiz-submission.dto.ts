import { ApiProperty } from '@nestjs/swagger';

export class ConceptQuizSubmissionDto {
  @ApiProperty({
    example: [
      { blank_index: 1, answer_index: 0 },
      { blank_index: 2, answer_index: 1 },
    ],
    description:
      '빈칸별 제출 답안 (blank_index: 몇 번째 빈칸, answer_index: 선택지 번호)',
  })
  answers: { blank_index: number; answer_index: number }[];
}
