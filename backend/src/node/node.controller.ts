import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NodeService } from './node.service';
import { RegisterNodeDto } from './dto/node.dto';

@Controller('nodes')
export class NodeController {
  constructor(private readonly nodesService: NodeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async registerNode(@Req() req, @Body() dto: RegisterNodeDto) {
    const userId = req.user.id;
    const node = await this.nodesService.registerNode(userId, dto);
    return { success: true, node };
  }
}
