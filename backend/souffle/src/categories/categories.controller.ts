import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('api/v1/categories')
export class CategoryController {
  constructor(private readonly categoriesService: CategoryService) {}

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
          // progress_rate: 0.8,
          children: [
            {
              id: 10,
              name: '지수와 로그',
              type: 2,
              // progress_rate: 0.7,
              children: [
                {
                  id: 100,
                  name: '지수가 정수일 때의 지수법칙',
                  type: 3,
                  // progress_rate: 0.5,
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
}
