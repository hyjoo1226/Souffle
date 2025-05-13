import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Get, Req } from '@nestjs/common';

@Controller('users')
export class UserController {
  @UseGuards(AuthGuard('jwt'))
  @Get('my-profile')
  async getMyProfile(@Req() req) {
    return req.user;
  }
}
