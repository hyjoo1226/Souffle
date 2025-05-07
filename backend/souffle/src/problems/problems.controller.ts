import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProblemService } from './problems.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('problems')
@Controller('api/v1/problems')
export class ProblemController {
  constructor(private readonly problemsService: ProblemService) {}

  // 개별 문제 조회 API
  @Get(':problem_id')
  @ApiOperation({ summary: '개별 문제 조회' })
  @ApiParam({ name: 'problem_id', description: '문제 ID' })
  @ApiResponse({
    status: 200,
    description: '문제 상세 정보 조회 성공',
    schema: {
      example: {
        problem_id: 1,
        category_id: 1,
        problem_no: '문제 문항코드',
        inner_no: 1,
        type: 1,
        content: '문제 본문',
        choice: {
          /* 보기 정보 */
        },
        problem_image_url: '이미지 URL',
        avg_accuracy: 75.5,
        book: {
          book_name: '문제집 이름',
          publisher: '출판사',
          year: 2023,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '문제를 찾을 수 없습니다' })
  async getProblem(@Param('problem_id', ParseIntPipe) problemId: number) {
    return this.problemsService.getProblem(problemId);
  }

  // 단원별 문제 조회 API
  @Get('category/:category_id')
  @ApiOperation({ summary: '단원별 문제 조회' })
  @ApiParam({ name: 'category_id', description: '단원 ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        category_id: 1,
        category_type: 2,
        category_name: '지수와 로그',
        problem: [
          {
            problem_id: 1,
            problem_no: 'A-1',
            inner_no: 1,
            problem_type: 1,
            content: '문제 본문',
            choice: {
              /* 보기 정보 */
            },
            problem_image_url: 'https://...',
            problem_avg_accuracy: 75.5,
            book: {
              book_name: '문제집1',
              publisher: '출판사',
              year: 2024,
            },
          },
        ],
      },
    },
  })
  async getProblemsByCategory(
    @Param('category_id', ParseIntPipe) categoryId: number,
  ) {
    return this.problemsService.getProblemsByCategory(categoryId);
  }
}
