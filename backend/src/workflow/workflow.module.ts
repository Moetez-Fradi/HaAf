import { Module } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { NodeService } from 'src/node/node.service';
import { HederaService } from 'src/hedera/hedera.service';

@Module({
  imports: [PrismaModule, HttpModule],
  providers: [WorkflowService, NodeService, HederaService],
  controllers: [WorkflowController]
})
export class WorkflowModule {}
