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
    @Request() req: any,
    @Body('walletAccountId') walletAccountId: string,
  ) {
    if (!walletAccountId) {
      throw new Error('Wallet account ID is required');
    }

    const userId = req.user.sub; 
    const updatedUser = await this.userService.linkWallet(userId, walletAccountId);
    
    return {
      message: 'Wallet linked successfully',
      user: updatedUser,
    };
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
