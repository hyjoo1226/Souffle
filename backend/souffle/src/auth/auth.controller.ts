import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  // 구글 OAuth
  @Get('google')
  // 구글 로그인 페이지 리다이렉트
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  // 구글 콜백 URL 리다이렉트
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    // req.user에 validate에서 반환한 유저 정보가 들어있음
    // 여기서 JWT 발급 및 프론트로 리다이렉트 등 처리
    // 예시: JWT 발급 후 프론트로 전달
    // const token = this.authService.login(req.user);
    // return res.redirect(`http://localhost:3001?token=${token}`);
    return res.json(req.user);
  }
}
