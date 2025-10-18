import { Controller, Post, Body, Query, UseGuards, Request, Param, Delete, HttpCode, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkflowService } from './workflow.service';

@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Post()
  async create(
    @Request() req,
    @Body('graphJson') graphJson: any,
    @Body('fixedUsageFee') fixedUsageFee?: number,
  ) {
    return this.workflowService.createWorkflow(req.user.id, req.user.walletAccountId, graphJson, fixedUsageFee);
  }

  @Post(':id/test')
  async test(@Request() req, @Param('id') id: string, @Body('graphJson') graphJson: any) {
    return this.workflowService.testWorkflow(req.user.id, id, graphJson);
  }

  @Post(':id/deploy')
  async deploy(@Request() req, @Param('id') id: string, @Body('graphJson') graphJson: any, @Body('tests') tests: Array<any>) {
    return this.workflowService.runDeployTests(req.user.id, id, graphJson, tests || []);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req, @Param('id') id: string) {
    await this.workflowService.deleteWorkflow(id, req.user.id);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.workflowService.findById(id);
  }

  @Get()
  async list(@Query('page') page: string) {
    const pageNum = parseInt(page) || 1;
    return this.workflowService.listWorkflows(pageNum, 10);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.workflowService.searchWorkflows(query, 10);
  }
}
