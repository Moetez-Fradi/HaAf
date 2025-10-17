import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrivateToolInstanceService } from './private-tool-instance.service';

@UseGuards(JwtAuthGuard)
@Controller('instances')
export class PrivateToolInstanceController {
  constructor(private service: PrivateToolInstanceService) {}

  @Post()
  async create(
    @Request() req,
    @Body('toolId') toolId: string,
    @Body('env') env: Record<string, string>,
  ) {
    return this.service.createInstance(req.user.id, toolId, env);
  }

  @Post(':id/run')
  async runInstance(
    @Request() req,
    @Param('id') id: string,
    @Body() inputBody: Record<string, any>,
  ) {
      const userId = req.user.id;
      return this.service.runInstance(userId, id, inputBody);
  }

  @Get()
  async list(@Request() req) {
    return this.service.getUserInstances(req.user.id);
  }

  @Get(':id')
  async get(@Request() req, @Param('id') id: string) {
    return this.service.getInstance(id, req.user.id);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.service.deleteInstance(id, req.user.id);
  }
}