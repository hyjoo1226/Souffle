import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // JWT 발급
  login(user: User) {
    const payload = {
      sub: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImage: user.profileImage,
      },
    };
  }
}
