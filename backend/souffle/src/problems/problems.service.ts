import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Problem } from './entities/problem.entity';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private problemRepository: Repository<Problem>,
  ) {}

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
}
