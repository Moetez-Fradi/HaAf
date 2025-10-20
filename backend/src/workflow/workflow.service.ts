import { Injectable, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService, private httpService: HttpService) {}

  private async enrichGraphWithTools(graphJson: any) {
    if (!graphJson?.nodes?.length) throw new BadRequestException('Invalid graph');

    const toolIds = graphJson.nodes.map(n => n.toolId);
    console.log(toolIds);
    const tools = await this.prisma.tool.findMany({ where: { id: { in: toolIds } } });
    const toolById = new Map(tools.map(t => [t.id, t]));

    const missing = toolIds.filter(id => !toolById.has(id));
    if (missing.length) throw new BadRequestException(`Tools not found: ${missing.join(',')}`);

    const notDeployed = tools.filter(t => t.status !== 'DEPLOYED');
    if (notDeployed.length) {
      throw new BadRequestException(
        `All tools must be DEPLOYED. Not deployed: ${notDeployed.map(t => t.name || t.id).join(', ')}`,
      );
    }

    const nodes = graphJson.nodes.map((n: any) => {
      const tool = toolById.get(n.toolId);
      return {
        ...n,
        dockerImageUrl: tool?.dockerImageUrl,
      };
    });

    return { nodes, edges: graphJson.edges ?? [] };
  }

  async createWorkflow(userId: string, wallet: string, graphJson: any, fixedUsageFee?: number) {
    if (!graphJson?.nodes?.length) throw new BadRequestException('Invalid graph');

    const toolIds = graphJson.nodes.map(n => n.toolId);
    const tools = await this.prisma.tool.findMany({ where: { id: { in: toolIds } } });

    const estimatedCost = tools.reduce((acc, t) =>
      acc + (t.fixedPrice ?? 0) + (t.dynamicInputCoeff ?? 0) + (t.dynamicOutputCoeff ?? 0), 0
    );

    const energyEstimate = tools.reduce((acc, t) =>
      acc + (t.energyBaseline ?? 0), 0
    );

    const workflow = await this.prisma.workflow.create({
      data: {
        ownerUserId: userId,
        graphJson,
        fixedUsageFee: fixedUsageFee ?? 0,
        estimatedCost,
        energyEstimate,
      },
    });

    return { success: true, workflow };
  }

  async findById(id: string) {
    const wf = await this.prisma.workflow.findUnique({ where: { id } });
    if (!wf) throw new NotFoundException('Workflow not found');
    return wf;
  }

  async deleteWorkflow(id: string, requestingUserId: string) {
    const wf = await this.prisma.workflow.findUnique({ where: { id } });
    if (!wf) throw new NotFoundException('Workflow not found');
    if (wf.ownerUserId !== requestingUserId) throw new ForbiddenException('Only owner can delete workflow');
    await this.prisma.workflow.delete({ where: { id } });
    return { success: true };
  }

  async testWorkflow(userId: string, workflowId: string, graphJson: any) {
    const wf = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) throw new NotFoundException('Workflow not found');
    if (wf.ownerUserId !== userId) throw new ForbiddenException('Only owner can test workflow');

    const payloadGraph = graphJson;
    const enriched = await this.enrichGraphWithTools(payloadGraph);

    const runnerUrl = process.env.WORKFLOW_RUNNER_URL || 'http://localhost:3111/run-workflow';
    const instanceId = `${workflowId}-test-${Date.now().toString(36)}`;

    let resp;
    try {
      resp = await lastValueFrom(this.httpService.post(runnerUrl, {
        instanceId,
        graphJson: { nodes: enriched.nodes, edges: enriched.edges },
      }));
    } catch (e) {
      throw new InternalServerErrorException('Failed to contact workflow runner');
    }

    const data = resp?.data;
    if (!data) throw new InternalServerErrorException('Empty response from runner');

    if (!data.usageUrl) {
      return { success: false, deployed: false, pending: true, instanceId };
    }

    const created = await this.prisma.privateWorkflowInstance.create({
      data: { ownerUserId: userId, graphJson: payloadGraph, usageUrl: data.usageUrl },
    });

    return { success: true, deployed: false, workflow: wf, instance: created };
  }

  async runDeployTests(userId: string, workflowId: string, graphJson: any, tests: Array<any>) {
    const wf = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) throw new NotFoundException('Workflow not found');
    if (wf.ownerUserId !== userId) throw new ForbiddenException('Only owner can deploy');

    const payloadGraph = graphJson ?? wf.graphJson;
    const enriched = await this.enrichGraphWithTools(payloadGraph);

    const runnerUrl = process.env.WORKFLOW_RUNNER_URL || 'http://localhost:3111/run-workflow-and-test';
    let resp;
    try {
      resp = await lastValueFrom(this.httpService.post(runnerUrl, {
        instanceId: `${workflowId}-deploytest-${Date.now().toString(36)}`,
        graphJson: { nodes: enriched.nodes, edges: enriched.edges },
        tests,
      }));
    } catch (e) {
      throw new InternalServerErrorException('Failed to contact workflow test runner');
    }

    const data = resp?.data;
    if (!data) throw new InternalServerErrorException('Empty response from runner');

    if (!data.passed) {
      return { success: false, reason: 'tests_failed', details: data };
    }

    const pricing = data.pricing ?? {};
    const energyBaseline = typeof data.energyBaseline === 'number' ? data.energyBaseline : null;

    const updated = await this.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        estimatedCost: pricing.estimatedCost ?? wf.estimatedCost,
        energyEstimate: energyBaseline ?? wf.energyEstimate,
      },
    });

    return { success: true, workflow: updated, testReport: data };
  }

  async listWorkflows(page = 1, limit = 10) {
    const items = await this.prisma.workflow.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await this.prisma.workflow.count();
    return { workflows: items, total, page, limit };
  }

  async searchWorkflows(query: string, limit = 10) {
    if (!query) return [];
    const items = await this.prisma.workflow.findMany({
      where: {},
      take: limit,
    });
    return items;
  }
}
