import { Module } from '@nestjs/common';
import { PrivateWorkflowInstanceController } from './private-workflow-instance.controller';
import { PrivateWorkflowInstanceService } from './private-workflow-instance.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [PrivateWorkflowInstanceController],
  providers: [PrivateWorkflowInstanceService]
})
export class PrivateWorkflowInstanceModule {}
