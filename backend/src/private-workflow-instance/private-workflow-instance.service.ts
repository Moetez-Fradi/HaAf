import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PrivateWorkflowInstanceService {
  constructor(private prisma: PrismaService, private httpService: HttpService) {}

  async createInstance(userId: string, workflowId: string, graphJson: any) {
    const wf = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) throw new NotFoundException('Workflow not found');

    const instance = await this.prisma.privateWorkflowInstance.create({
      data: { ownerUserId: userId, graphJson: graphJson ?? wf.graphJson },
    });

    // here goes the encryption logic, it's still not impelemented but the env vars shouldnt be stored in the db
    // const encryptedGraph = encryptJson(graphJson ?? wf.graphJson);


    const runnerUrl = process.env.WORKFLOW_RUNNER_URL || 'http://localhost:3111/run-workflow';
    try {
      const resp = await lastValueFrom(this.httpService.post(runnerUrl, {
        instanceId: instance.id,
        graphJson: instance.graphJson,
      }));

      if (resp?.data?.usageUrl) {
        const updated = await this.prisma.privateWorkflowInstance.update({
          where: { id: instance.id },
          data: { usageUrl: resp.data.usageUrl },
        });
        return updated;
      }
      return instance;
    } catch (e) {
      throw new InternalServerErrorException('Failed to contact workflow runner');
    }
  }

  async runInstance(userId: string, instanceId: string, inputBody: Record<string, any>) {
    const instance = await this.getInstance(instanceId, userId);
    if (!instance.usageUrl) throw new InternalServerErrorException('Instance not ready yet');

    try {
      const targetUrl = `${instance.usageUrl.replace(/\/$/, '')}/run`;
      const resp = await lastValueFrom(this.httpService.post(targetUrl, inputBody));
      return resp.data;
    } catch (err: any) {
      throw new InternalServerErrorException('Failed to run the workflow');
    }
  }

  async getUserInstances(userId: string) {
    return this.prisma.privateWorkflowInstance.findMany({ where: { ownerUserId: userId } });
  }

  async getInstance(id: string, userId: string) {
    const inst = await this.prisma.privateWorkflowInstance.findUnique({ where: { id } });
    if (!inst) throw new NotFoundException('Instance not found');
    if (inst.ownerUserId !== userId) throw new ForbiddenException('Not your instance');
    return inst;
  }

  async deleteInstance(id: string, userId: string) {
    const inst = await this.prisma.privateWorkflowInstance.findUnique({ where: { id } });
    if (!inst) throw new NotFoundException('Instance not found');
    if (inst.ownerUserId !== userId) throw new ForbiddenException('Not your instance');
    await this.prisma.privateWorkflowInstance.delete({ where: { id } });
    return { success: true };
  }
}
