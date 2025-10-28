import { Injectable, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HederaService } from '../hedera/hedera.service';


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

  private async fallbackToLocalRunner(workflowId, enriched, tests, userId) {
    const runnerUrl = process.env.WORKFLOW_DEPLOYER_URL || 'http://localhost:3111/run-workflow-and-test';
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
    if (!data.success) return { success: false, reason: 'tests_failed', details: data };
    await this.prisma.workflow.update({ where: { id: workflowId }, data: { workflowStatus: 'DEPLOYED' } });
    const created = await this.prisma.privateWorkflowInstance.create({
      data: { ownerUserId: userId, graphJson: enriched, usageUrl: data.workflowUsageUrl },
    });
    return { success: true, workflow: workflowId, usageUrl: data.workflowUsageUrl, testReport: data };
  }

  async createWorkflow(userId: string, wallet: string, graphJson: any, name?: string, fixedUsageFee?: number, description?: string) {
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
        name: name,
        description: description,
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
    const wf = await this.prisma.workflow.findUnique({
      where: { id },
      include: { owner: true },
    });
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

    return { success: true, deployed: false, workflow: wf.id, instance: created.id };
  }

  async runDeployTests(userId: string, workflowId: string, graphJson: any, tests: Array<any>) {
    const wf = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) throw new NotFoundException('Workflow not found');
    if (wf.ownerUserId !== userId) throw new ForbiddenException('Only owner can deploy');

    const payloadGraph = graphJson ?? wf.graphJson;
    const enriched = await this.enrichGraphWithTools(payloadGraph);
    const requiredCount = enriched.nodes.length;

    const availableNodes = await this.prisma.node.findMany({ where: { status: 'ONLINE' } });
    if (availableNodes.length < requiredCount) {
      console.log("Not enough available nodes, falling back to local runner");
      return await this.fallbackToLocalRunner(workflowId, enriched, tests, userId);
    }
    const selectedNodes = availableNodes.slice(0, requiredCount);
    console.log("nodes exist!");

  const tokens: { nodeId: string; jti: string; expiresAt: Date }[] = [];
  try {
    const tx = await this.prisma.$transaction(
      selectedNodes.map(n => this.prisma.node.update({
        where: { id: n.id },
        data: { status: 'BUSY' },
      }))
    );

    const deployments: { nodeId: string; usageUrl: string }[] = [];

    for (let i = 0; i < selectedNodes.length; i++) {
      const node = selectedNodes[i];
      const nodeSpec = enriched.nodes[i];

      console.log(`Deploying to node ${node.id} at ${node.url}`);

      const jti = uuidv4();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
      await this.prisma.oneTimeToken.create({
        data: {
          jti,
          taskId: `${workflowId}-deploy-${Date.now().toString(36)}-${i}`,
          nodeId: node.id,
          expiresAt,
        },
      });

      const deployUrl = `${node.url.replace(/\/$/, '')}/start-container`;
      try {
        console.log("deploying");
        const resp = await lastValueFrom(this.httpService.post(
          deployUrl,
          {
            instanceId: `${workflowId}-${nodeSpec.id}`,
            dockerImageUrl: nodeSpec.dockerImageUrl,
            env: nodeSpec.env || {},
            token: jti,
          },
          { timeout: 60_000 }
        ));

        const usageUrl = resp.data?.usageUrl;
        if (!usageUrl) throw new Error('Missing usageUrl from node');

        deployments.push({ nodeId: node.id, usageUrl });
      } catch (err) {
        throw new Error(`Failed to deploy on node ${node.id}: ${err?.message || err}`);
      }
    }

    const mapping: Record<string, string> = {};
    enriched.nodes.forEach((n, idx) => {
      mapping[n.id] = deployments[idx].usageUrl;
    });

    const runnerUrl = process.env.WORKFLOW_DECENTRALIZED_RUNNER_URL || 'http://localhost:3111/register-decentralized';
    const registerResp = await lastValueFrom(this.httpService.post(runnerUrl, {
      instanceId: `${workflowId}-deploytest-${Date.now().toString(36)}`,
      graphJson: enriched,
      mapping,
      tests,
    }));

    const data = registerResp.data;
    if (!data || !data.workflowUsageUrl) throw new InternalServerErrorException('Runner failed to register decentralized workflow');

    await this.prisma.workflow.update({ where: { id: workflowId }, data: { workflowStatus: 'DEPLOYED' } });
    const created = await this.prisma.privateWorkflowInstance.create({
      data: {
        workflowId: workflowId,
        ownerUserId: userId,
        graphJson: payloadGraph,
        usageUrl: data.workflowUsageUrl,
      },
    });

    return { success: true, workflow: workflowId, usageUrl: data.workflowUsageUrl, mapping, runnerReport: data };

  } catch (err) {
    await Promise.all(selectedNodes.map(async n => {
      try { await this.prisma.node.update({ where: { id: n.id }, data: { status: 'ONLINE' } }); } catch {}
    }));
    await this.prisma.oneTimeToken.deleteMany({
      where: { nodeId: { in: selectedNodes.map(n => n.id) }, used: false }
    }).catch(()=>{});
    throw new InternalServerErrorException(err.message || String(err));
  }
  }

  async listWorkflows(page = 1, limit = 10) {
    const items = await this.prisma.workflow.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where : { workflowStatus: "DEPLOYED"},
        include: {
    owner: {
      select: {
        displayName: true,
      },
    },
  },
    });
    const total = await this.prisma.workflow.count();
    return { workflows: items, total, page, limit };
  }

  async searchWorkflows(query: string, limit = 10) {
    if (!query) return [];

    const normalizedQuery = query.trim();

    const items = await this.prisma.workflow.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery } },
          { description: { contains: normalizedQuery } },
        ],
      },
      take: limit,
    });

    return items;
  }
}
