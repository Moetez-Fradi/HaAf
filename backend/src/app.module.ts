import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ToolModule } from './tool/tool.module';
import { ReviewModule } from './review/review.module';
import { PrivateToolInstanceModule } from './private-tool-instance/private-tool-instance.module';
import { WorkflowModule } from './workflow/workflow.module';
import { PrivateWorkflowInstanceModule } from './private-workflow-instance/private-workflow-instance.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ToolModule, ReviewModule, PrivateToolInstanceModule, WorkflowModule, PrivateWorkflowInstanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
