import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('categories')
@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly categoriesService: CategoryService) {}

  // 전체 단원 조회 API
  @Get('tree')
  @ApiOperation({ summary: '전체 단원 트리 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 단원 트리',
    schema: {
      example: [
        {
          id: 1,
          name: '공통수학1',
          type: 1,
          children: [
            {
              id: 10,
              name: '지수와 로그',
              type: 2,
              children: [
                {
                  id: 100,
                  name: '지수가 정수일 때의 지수법칙',
                  type: 3,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  })
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  // 단원의 모든 상위 단원 조회 API
  @Get(':category_id/ancestors')
  @ApiOperation({ summary: '단원의 모든 상위 단원 조회' })
  @ApiParam({ name: 'category_id', description: '단원 ID' })
  @ApiResponse({
    status: 200,
    description: '상위 단원 리스트',
    schema: {
      example: {
        current: { id: 20, name: '소단원', type: 3 },
        ancestors: [
          { id: 10, name: '중단원', type: 2 },
          { id: 1, name: '대단원', type: 1 },
        ],
      },
    },
  })
  async getAncestors(@Param('category_id', ParseIntPipe) categoryId: number) {
    return this.categoriesService.getAncestors(categoryId);
  }

  // 단원 상세 조회 API
  @UseGuards(AuthGuard('jwt'))
  @Get(':category_id')
  @ApiOperation({ summary: '단원 상세 조회' })
  @ApiParam({ name: 'category_id', description: '단원 ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        category_id: 1,
        avg_accuracy: 83.2,
        learning_content: '지수와 로그의 기본 개념을 학습합니다.',
        concept_explanation: '지수법칙, 로그의 정의 등',
        user: {
          accuracy: 90.5,
          progress_rate: 0.8,
          solve_time: 1200,
        },
        problem: [
          {
            problem_id: 1,
            inner_no: 1,
            type: 1,
            problem_avg_accuracy: 80.0,
            try_count: 5,
            correct_count: 4,
          },
        ],
      },
    },
  })
  async getCategoryDetail(
    @Param('category_id', ParseIntPipe) categoryId: number,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.categoriesService.getCategoryDetail(categoryId, userId);
  }
}
