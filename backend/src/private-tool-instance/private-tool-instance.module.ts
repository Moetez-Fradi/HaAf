import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { PrivateToolInstanceService } from './private-tool-instance.service';
import { PrivateToolInstanceController } from './private-tool-instance.controller';
import { ToolModule } from '../tool/tool.module';

@Module({
  imports: [HttpModule, forwardRef(() => ToolModule)],
  controllers: [PrivateToolInstanceController],
  providers: [PrivateToolInstanceService, PrismaService],
  exports: [PrivateToolInstanceService],
})
export class PrivateToolInstanceModule {}