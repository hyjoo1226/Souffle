import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConceptService } from './concepts.service';
import { ConceptQuizSubmissionDto } from './dto/concept-quiz-submission.dto';

@ApiTags('Concepts')
@Controller('api/v1/concepts')
export class ConceptController {
  constructor(private readonly conceptService: ConceptService) {}

  // 단원 개념 문제 조회 API
  @ApiOperation({ summary: '단원 개념 문제 조회' })
  @ApiParam({ name: 'category_id', description: '단원 ID', type: Number })
  @ApiOkResponse({
    description: '단원의 개념 문제 목록',
    schema: {
      example: {
        category_id: 3,
        concepts: [
          {
            concept_id: 1,
            title: '상관관계 분석',
            quizzes: [
              {
                quiz_id: 5,
                content:
                  '상관계수는 [BLANK_0]와 [BLANK_1] 사이의 관계를 나타낸다.',
                order: 1,
                blanks: [
                  {
                    blank_id: 10,
                    blank_index: 0,
                    answer_index: 0,
                    choice: ['변수', '데이터', '숫자'],
                  },
                  {
                    blank_id: 11,
                    blank_index: 1,
                    answer_index: 1,
                    choice: ['표본', '변수', '모수'],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  })
  @Get(':category_id/quiz')
  async getCategoryQuizzes(@Param('category_id') categoryId: number) {
    return this.conceptService.getCategoryQuizzes(categoryId);
  }

  // 개념 문제 제출 API
  @ApiOperation({ summary: '개념 문제 답안 제출' })
  @ApiParam({ name: 'quiz_id', description: '퀴즈 ID', type: Number })
  @ApiBody({ type: ConceptQuizSubmissionDto })
  @ApiOkResponse({
    description: '정답 여부 및 제출 ID 반환',
    schema: {
      example: {
        is_correct: true,
        quiz_submission_id: 123,
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('quiz/:quiz_id/submission')
  async submitQuizAnswer(
    @Req() req,
    @Param('quiz_id') quizId: number,
    @Body() dto: ConceptQuizSubmissionDto,
  ) {
    const userId = req.user.id;

    return this.conceptService.submitQuizAnswer(userId, quizId, dto.answers);
  }
}
