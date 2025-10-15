import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':email')
  async getByEmail(@Param('email') email: string) {
    return this.userService.findByEmailNoPassword(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-wallet')
  async linkWallet(
    @Request() req,
    @Body('walletAccountId') walletAccountId: string,
  ) {
    const userId = req.user.id;
    return this.userService.linkWallet(userId, walletAccountId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-name')
  async updateName(
    @Request() req,
    @Body('displayName') displayName: string,
  ) {
    const userId = req.user.id;
    return this.userService.updateName(userId, displayName);
  }
}
