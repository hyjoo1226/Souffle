import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 구글 OAuth
  @Get('google')
  // 구글 로그인 페이지 리다이렉트
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // 구글 콜백 URL 리다이렉트
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const token = await this.authService.login(req.user);

    const user = req.user;
    const frontendRedirectUrl = new URL(
      'https://www.souffle.kr/popup-login.html',
    );

    frontendRedirectUrl.searchParams.set('access_token', token.access_token);
    frontendRedirectUrl.searchParams.set('refresh_token', token.refresh_token);
    frontendRedirectUrl.searchParams.set('id', user.id);
    frontendRedirectUrl.searchParams.set('nickname', user.nickname);
    frontendRedirectUrl.searchParams.set('email', user.email);
    frontendRedirectUrl.searchParams.set('profileImage', user.profileImage);

    res.redirect(frontendRedirectUrl.toString());
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}
