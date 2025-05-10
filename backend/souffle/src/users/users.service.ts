import { Injectable } from '@nestjs/common';
import { UserCategoryProgress } from './entities/user-category-progress.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAuthentication } from './entities/user-authentication.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAuthentication)
    private userAuthenticationRepository: Repository<UserAuthentication>,
    @InjectRepository(UserCategoryProgress)
    private userCategoryRepository: Repository<UserCategoryProgress>,
  ) {}

  // 이메일로 유저 찾기
  async findUserByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    const userAuth = await this.userAuthenticationRepository.findOne({
      where: { provider, providerId },
      relations: ['user'],
    });
    return userAuth ? userAuth.user : null;
  }

  // 닉네임 중복 체크 및 랜덤 문자열 추가
  async generateUniqueNickname(baseNickname: string): Promise<string> {
    let nickname = baseNickname;
    let exists = await this.userRepository.findOne({ where: { nickname } });
    while (exists) {
      // 랜덤 4자리 숫자 추가
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      nickname = `${baseNickname}${randomNum}`;
      exists = await this.userRepository.findOne({ where: { nickname } });
    }
    return nickname;
  }

  // 소셜 로그인 시 유저 없으면 생성
  async create(userInfo: Partial<User>): Promise<User> {
    const baseNickname =
      userInfo.nickname || `User${Math.floor(Math.random() * 1000)}`;
    const nickname = await this.generateUniqueNickname(baseNickname);

    const user = this.userRepository.create({
      ...userInfo,
      nickname,
    });
    return this.userRepository.save(user);
  }

  // 유저 통계 정보
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
