import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.userService.createUser(email, password);
  }

  @Get(':email')
  async getByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Post('link-wallet')
  async linkWallet(
    @Body('userId') userId: string,
    @Body('wallet') wallet: string,
  ) {
    return this.userService.linkWallet(userId, wallet);
  }
}
