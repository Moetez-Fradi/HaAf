import { forwardRef, Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { PrivateToolInstanceModule } from '../private-tool-instance/private-tool-instance.module';

@Module({
  providers: [ToolService, PrivateToolInstanceModule],
  controllers: [ToolController],
  imports: [PrismaModule, HttpModule, forwardRef(() => PrivateToolInstanceModule)]
})
export class ToolModule {}
