import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from './entities/problem.entity';
import { In } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { UserProblem } from 'src/users/entities/user-problem.entity';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // 개별 문제 조회 API
  async getProblem(problemId: number) {
    const problem = await this.problemRepository.findOne({
      where: { id: problemId },
      relations: ['book', 'category'],
    });

    if (!problem) {
      throw new NotFoundException('문제를 찾을 수 없습니다');
    }

    return {
      problem_id: problem.id,
      category_id: problem.category.id,
      problem_no: problem.problemNo,
      inner_no: problem.innerNo,
      type: problem.type,
      content: problem.content,
      choice: problem.choice,
      problem_image_url: problem.problemImageUrl,
      avg_accuracy: problem.avgAccuracy,
      book: {
        book_name: problem.book.name,
        publisher: problem.book.publisher,
        year: problem.book.year,
      },
    };
  }

  // 개별 문제 조회 (모든 데이터) API
  async getProblemFull(problemId: number, userId: number) {
    const problem = await this.problemRepository
      .createQueryBuilder('problem')
      .leftJoinAndSelect('problem.category', 'category')
      .leftJoinAndSelect('problem.book', 'book')
      .leftJoinAndMapOne(
        'problem.user_stats',
        UserProblem,
        'up',
        'up.user_id = :userId AND up.problem_id = problem.id',
        { userId },
      )
      .where('problem.id = :problemId', { problemId })
      .getOne();

    if (!problem) throw new NotFoundException('문제를 찾을 수 없습니다');

    return {
      problem_id: problem.id,
      category_id: problem.category?.id,
      problem_no: problem.problemNo,
      inner_no: problem.innerNo,
      type: problem.type,
      content: problem.content,
      choice: problem.choice,
      problem_image_url: problem.problemImageUrl,
      avg_accuracy: problem.avgAccuracy,
      avg_total_solve_time: problem.avgTotalSolveTime,
      avg_understand_time: problem.avgUnderstandTime,
      avg_solve_time: problem.avgSolveTime,
      avg_review_time: problem.avgReviewTime,
      book: {
        book_name: problem.book.name,
        publisher: problem.book.publisher,
        year: problem.book.year,
      },
      user_stats: problem.user_stats
        ? {
            try_count: problem.user_stats.try_count || 0,
            correct_count: problem.user_stats.correct_count || 0,
            last_submission_id: problem.user_stats.last_submission_id,
            wrong_note_folder_id: problem.user_stats.wrong_note_folder_id,
            favorite_folder_id: problem.user_stats.favorite_folder_id,
          }
        : {
            try_count: 0,
            correct_count: 0,
            last_submission_id: null,
            wrong_note_folder_id: null,
            favorite_folder_id: null,
          },
    };
  }

  // 단원별 문제 조회 API
  async getProblemsByCategory(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('단원을 찾을 수 없습니다.');

    // 2. 하위 단원 포함 ID 조회(재귀 CTE)
    const queryRunner =
      this.problemRepository.manager.connection.createQueryRunner();
    const categoryIds = await queryRunner.query(
      `
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c
        INNER JOIN subcategories s ON c."parentId" = s.id
      )
      SELECT id FROM subcategories
    `,
      [categoryId],
    );
    await queryRunner.release();

    // 해당 단원 및 하위 단원에 속한 문제 조회
    const problems = await this.problemRepository.find({
      where: { category: { id: In(categoryIds.map((c) => c.id)) } },
      relations: ['book'],
    });

    return {
      category_id: category.id,
      category_type: category.type,
      category_name: category.name,
      problem: problems.map((problem) => ({
        problem_id: problem.id,
        problem_no: problem.problemNo,
        inner_no: problem.innerNo,
        problem_type: problem.type,
        content: problem.content,
        choice: problem.choice,
        problem_image_url: problem.problemImageUrl,
        problem_avg_accuracy: problem.avgAccuracy,
        book: {
          book_name: problem.book.name,
          publisher: problem.book.publisher,
          year: problem.book.year,
        },
      })),
    };
  }
}
