import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body('email') email: string, @Body('password') password: string, @Body('displayName') displayName?: string,) {
    const finalName =
      displayName?.trim() || `user_${Math.floor(100000 + Math.random() * 900000)}`;
    return this.authService.register(email, password, finalName);
  }

  @Post('login')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user);
  }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Request() req) {
    const { password, ...user } = req.user;
    return user;
    }
}
