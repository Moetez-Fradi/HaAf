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

  // --------------------------
  // NEW: fetch tools owned by the user (with rating and reviewsCount)
  // --------------------------
  async findToolsByOwner(userId: string) {
    // 1) get user's walletAccountId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAccountId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const wallet = user.walletAccountId;
    if (!wallet) {
      // no wallet -> no tools by ownerWallet
      return [];
    }

    // 2) fetch tools owned by that wallet
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

    // 3) aggregate reviews by toolId to compute avg rating and count in one query
    // groupBy returns an array of { toolId, _avg: { stars }, _count: { _all } }
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

    // 4) map tools -> DTO shape expected by frontend
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
  // --------------------------
  // NEW: fetch workflows owned by the user
  // --------------------------
  async findWorkflowsByOwner(userId: string) {
    // find workflows where ownerUserId === userId
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

    // Map to simple DTO
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
