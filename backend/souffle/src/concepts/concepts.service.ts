import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concept } from './entities/concept.entity';
import { ConceptQuiz } from './entities/concept-quiz.entity';
import { ConceptQuizBlank } from './entities/concept-quiz-blank.entity';
import { ConceptQuizSubmission } from './entities/concept-quiz-submission.entity';

@Injectable()
export class ConceptService {
  constructor(
    @InjectRepository(Concept)
    private conceptRepository: Repository<Concept>,
    @InjectRepository(ConceptQuiz)
    private conceptQuizRepository: Repository<ConceptQuiz>,
    @InjectRepository(ConceptQuizBlank)
    private conceptQuizBlankRepository: Repository<ConceptQuizBlank>,
    @InjectRepository(ConceptQuizSubmission)
    private conceptQuizSubmissionRepository: Repository<ConceptQuizSubmission>,
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

  // 개념 문제 제출 API
  async submitQuizAnswer(
    userId: number,
    quizId: number,
    answers: { blank_index: number; answer_index: number }[],
  ) {
    const quiz = await this.conceptQuizRepository.findOne({
      where: { id: quizId },
    });
    if (!quiz) throw new NotFoundException('해당 퀴즈를 찾을 수 없습니다.');

    // 정답 비교
    const blanks = await this.conceptQuizBlankRepository.find({
      where: { conceptQuizId: quizId },
    });
    let isCorrect = true;
    for (const blank of blanks) {
      const userAnswer = answers.find(
        (a) => a.blank_index === blank.blankIndex,
      );
      if (!userAnswer || userAnswer.answer_index !== blank.answerIndex) {
        isCorrect = false;
        break;
      }
    }

    // 풀이 기록 저장
    const submission = this.conceptQuizSubmissionRepository.create({
      userId,
      conceptQuizId: quizId,
      isCorrect,
      answers,
    });
    await this.conceptQuizSubmissionRepository.save(submission);

    return {
      is_correct: isCorrect,
      quiz_submission_id: submission.id,
    };
  }
}
