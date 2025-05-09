import { Injectable } from '@nestjs/common';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserCategoryProgress)
    private userCategoryRepository: Repository<UserCategoryProgress>,
  ) {}

  async getUserCategoryStats(userId: number, categoryId: number) {
    const progress = await this.userCategoryRepository.findOne({
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
