import { Module } from '@nestjs/common';
import { NodeMonitorService } from './node-monitor.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [NodeMonitorService, PrismaService]
})
export class NodeMonitorModule {}
