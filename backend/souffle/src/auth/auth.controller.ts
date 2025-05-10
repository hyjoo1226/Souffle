import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
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
    // JWT 발급
    const token = this.authService.login(req.user);
    // 프론트엔드로 리다이렉트 + 토큰 전달
    return res.json({ token: token.access_token, user: req.user });
  }
}
