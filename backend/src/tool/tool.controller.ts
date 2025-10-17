import { Controller, Post, Body, Query, UseGuards, Request, Param, Delete, HttpCode, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToolService } from './tool.service';
import { CreateToolDto } from './dto/tool.dto';

@UseGuards(JwtAuthGuard)
@Controller('tools')
export class ToolController {
  constructor(private toolService: ToolService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateToolDto) {
    const user = req.user;
    return this.toolService.createTool(user.id, user.walletAccountId, dto);
  }

  @Post(':id/test')
  async test(
    @Request() req,
    @Param('id') id: string,
    @Body('env') env: Record<string, string>,
  ) {
    return this.toolService.testTool(req.user.id, req.user.walletAccountId, id, env);
  }

  @Post(':id/deploy')
  async deploy(
    @Request() req,
    @Param('id') id: string,
    @Body('env') env: Record<string,string>,
    @Body('tests') tests: Array<any>,
  ) {
    return this.toolService.runDeployTests(req.user.id, req.user.walletAccountId, id, env, tests || []);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req, @Param('id') id: string) {
    const user = req.user;
    await this.toolService.deleteTool(id, user.walletAccountId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.toolService.findById(id);
  }

  @Get()
  async list(@Query('page') page: string) {
    const pageNum = parseInt(page) || 1;
    return this.toolService.listTools(pageNum, 10);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.toolService.searchTools(query, 10);
  }
}
