import { Controller, Post, Body, Get, Param, Patch, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getByEmail(@Param('id') id: string) {
    const u = await this.userService.findByIdNoPassword(id);
    if (!u) throw new NotFoundException('User not found');
    return { user: u };
  }

  @Get(':id/nodes')
  async getUserNodeCount(@Param('id') id: string) {
    return this.userService.getUserNodeCount(id);
  }

  @Get(':id/tools')
  async getToolsByUser(@Param('id') id: string) {
    const tools = await this.userService.findToolsByOwner(id);
    return { tools };
  }

  @Get(':id/workflows')
  async getWorkflowsByUser(@Param('id') id: string) {
    const wfs = await this.userService.findWorkflowsByOwner(id);
    return { workflows: wfs };
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

    const userId = req.user.id; 
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
