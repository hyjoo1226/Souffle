import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { UserAuthentication } from 'src/users/entities/user-authentication.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserAuthentication)
    private userAuthRepository: Repository<UserAuthentication>,
    private userService: UserService,
  ) {}

  // JWT 발급
  async login(user: User) {
    const payload = {
      sub: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
    );

    await this.userAuthRepository.update(
      { user: { id: user.id }, provider: 'google' },
      { refreshToken },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImage: user.profileImage,
      },
    };
  }

  // 액세스 토큰 재발급
  async refresh(refreshToken: string) {
    try {
      // 리프레시 토큰 검증
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;

      // DB에서 리프레시 토큰 존재 여부 확인
      const userAuth = await this.userAuthRepository.findOne({
        where: {
          user: { id: userId },
          provider: 'google',
          refreshToken,
        },
      });

      if (!userAuth) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰');
      }

      // 새 액세스 토큰 발급
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('유저를 찾을 수 없습니다.');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }
  }
}
