import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string, displayName?: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hash , displayName},
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }});
  }

  async findByIdNoPassword(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, password: false, email: true, displayName: true, walletAccountId: true, createdAt: true },
    });
  }

  async linkWallet(userId: string, walletAccountId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { walletAccountId },
      select: { id: true, email: true, displayName: true, walletAccountId: true },
    });
  }

  async updateName(userId: string, displayName: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { displayName },
    });
  }

  async findToolsByOwner(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAccountId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const wallet = user.walletAccountId;
    if (!wallet) {
      return [];
    }

    const tools = await this.prisma.tool.findMany({
      where: { ownerWallet: wallet },
      select: {
        id: true,
        name: true,
        description: true,
        usageCount: true,
        fixedPrice: true,
        priceMode: true,
        status: true,
        createdAt: true,
      },
    });

    if (tools.length === 0) return [];

    const toolIds = tools.map(t => t.id);

    const ratings = await this.prisma.review.groupBy({
      by: ['toolId'],
      where: { toolId: { in: toolIds } },
      _avg: { stars: true },
      _count: { _all: true },
    });

    const ratingMap = new Map<string, { avg?: number | null; count: number }>();
    for (const r of ratings) {
      ratingMap.set(r.toolId, { avg: r._avg?.stars ?? null, count: r._count?._all ?? 0 });
    }

    const result = tools.map(t => {
      const info = ratingMap.get(t.id) ?? { avg: null, count: 0 };
      if (!info.avg) {
        info.avg = null;
      }
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        rating: info.avg === null ? null : Number((info?.avg).toFixed(2)),
        reviewsCount: info.count,
        usageCount: t.usageCount ?? 0,
        fixedPrice: t.fixedPrice ?? null,
        priceMode: t.priceMode ?? null,
        status: t.status ?? null,
        createdAt: t.createdAt,
      };
    });

    return result;
  }

  async getUserNodeCount(userId: string) {
    const count = await this.prisma.node.count({
      where: { ownerUserId: userId },
    });

    return { userId, nodeCount: count };
  }

  async findWorkflowsByOwner(userId: string) {
    const wfs = await this.prisma.workflow.findMany({
      where: { ownerUserId: userId, workflowStatus: { not: 'TESTING' } },
      select: {
        id: true,
        name: true,
        description: true,
        fixedUsageFee: true,
        estimatedCost: true,
        usageUrl: true,
        workflowStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return wfs.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      fixedUsageFee: w.fixedUsageFee,
      estimatedCost: w.estimatedCost,
      usageUrl: w.usageUrl,
      workflowStatus: w.workflowStatus,
      createdAt: w.createdAt,
    }));
  }
}
