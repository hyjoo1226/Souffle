import { Injectable } from '@nestjs/common';
import { UserProblemProgress } from './entities/user_problem_progress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserProblemProgress)
    private userProgressRepository: Repository<UserProblemProgress>,
  ) {}

  async getUserCategoryStats(userId: number, categoryId: number) {
    const progress = await this.userProgressRepository.findOne({
      where: { userId, categoryId },
    });

    if (!progress) {
      // 유저 통계가 없는 경우 기본값 반환
      return {
        accuracy: null,
        progress_rate: null,
        solve_time: null,
        concept_rate: null,
        understanding: null,
      };
    }

    return {
      accuracy: progress.testAccuracy,
      progress_rate: progress.progressRate,
      solve_time: progress.solveTime,
      concept_rate: progress.conceptRate,
      understanding: progress.understanding,
    };
  }
}
