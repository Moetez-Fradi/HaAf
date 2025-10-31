import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrivateToolInstanceService } from './private-tool-instance.service';

@Controller('instances')
export class PrivateToolInstanceController {
  constructor(private service: PrivateToolInstanceService) {}
  @UseGuards(JwtAuthGuard)
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
      return this.service.runInstance(id, inputBody);
  }

  @Get()
  async list(@Request() req) {
    return this.service.getUserInstances(req.user.id);
  }

  @Get(':id')
  async get(@Request() req, @Param('id') id: string) {
    return this.service.getInstance(id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.service.deleteInstance(id, req.user.id);
  }
}