import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concept } from './entities/concept.entity';
import { ConceptQuiz } from './entities/concept-quiz.entity';
import { ConceptQuizBlank } from './entities/concept-quiz-blank.entity';

@Injectable()
export class ConceptService {
  constructor(
    @InjectRepository(Concept)
    private conceptRepository: Repository<Concept>,
    @InjectRepository(ConceptQuiz)
    private conceptQuizRepository: Repository<ConceptQuiz>,
    @InjectRepository(ConceptQuizBlank)
    private conceptQuizBlankRepository: Repository<ConceptQuizBlank>,
  ) {}

  // 단원 개념 문제 조회 API
  async getCategoryQuizzes(categoryId: number) {
    const concepts = await this.conceptRepository.find({
      where: { categoryId },
      order: { order: 'ASC' },
    });

    if (!concepts.length) {
      throw new NotFoundException(
        `단원 ID ${categoryId}에 해당하는 개념이 없습니다.`,
      );
    }

    // 개념 퀴즈와 빈칸 정보 조회
    const result = await Promise.all(
      concepts.map(async (concept) => {
        const quizzes = await this.conceptQuizRepository.find({
          where: { conceptId: concept.id },
          order: { order: 'ASC' },
        });
        const quizzesWithBlanks = await Promise.all(
          quizzes.map(async (quiz) => {
            const blanks = await this.conceptQuizBlankRepository.find({
              where: { conceptQuizId: quiz.id },
              order: { blankIndex: 'ASC' },
            });

            return {
              quiz_id: quiz.id,
              content: quiz.content,
              order: quiz.order,
              blanks: blanks.map((blank) => ({
                blank_id: blank.id,
                blank_index: blank.blankIndex,
                answer_index: blank.answerIndex,
                choice: blank.choice,
              })),
            };
          }),
        );

        return {
          concept_id: concept.id,
          title: concept.title,
          quizzes: quizzesWithBlanks,
        };
      }),
    );

    return {
      category_id: categoryId,
      concepts: result,
    };
  }
}
