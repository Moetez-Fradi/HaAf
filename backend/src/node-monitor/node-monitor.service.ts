import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NodeStatus } from '@prisma/client';

@Injectable()
export class NodeMonitorService {
  private readonly logger = new Logger(NodeMonitorService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkOfflineNodes() {
    const threshold = new Date(Date.now() - 6 * 60 * 1000);
    const result = await this.prisma.node.updateMany({
      where: {
        status: NodeStatus.ONLINE,
        lastSeenAt: { lt: threshold },
      },
      data: { status: NodeStatus.OFFLINE },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} nodes as OFFLINE due to missed heartbeat`);
    }
  }
}
