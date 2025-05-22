import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptionsWithRequest,
  VerifyCallback,
} from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/users/users.service';
import { UserAuthentication } from 'src/users/entities/user-authentication.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private userService: UserService,
    @InjectRepository(UserAuthentication)
    private userAuthRepository: Repository<UserAuthentication>,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_KEY,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { emails, name, photos } = profile;
    // DB에서 유저 찾기
    const userAuth = await this.userAuthRepository.findOne({
      where: {
        provider: 'google',
        providerId: profile.id,
      },
      relations: ['user'],
    });

    // 기존 유저가 있으면 반환
    if (userAuth) {
      return done(null, userAuth.user);
    }

    // 없으면 새 유저 + UserAuthentication 생성
    const givenName = name.givenName ?? '';
    const familyName = name.familyName ?? '';
    const newUser = await this.userService.create({
      nickname: familyName + givenName,
      profileImage: photos[0].value,
    });

    await this.userAuthRepository.save({
      provider: 'google',
      providerId: profile.id,
      email: emails[0].value,
      user: newUser,
      accessToken,
      refreshToken,
    });

    done(null, newUser);
  }
}
