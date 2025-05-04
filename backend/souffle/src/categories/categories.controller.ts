import { Controller, Get } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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
}
