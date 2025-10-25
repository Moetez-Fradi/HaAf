import { Controller, Post, Body, UseGuards, Req, Patch, Get } from '@nestjs/common';
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
  
  @UseGuards(JwtAuthGuard)
  @Patch('status')
  async updateStatus(@Req() req, @Body() body: { nodeId: string; status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'ERROR' }) {
    const updated = await this.nodesService.updateStatus( body.nodeId, body.status);
    return { success: true, node: updated };
  }

  // in production change to pagination
  @Get()
  async getNodes() {
    const nodes = await this.nodesService.getAllNodes();
    return { success: true, nodes };
  }
}
