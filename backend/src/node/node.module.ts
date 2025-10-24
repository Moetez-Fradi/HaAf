import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [NodeService, PrismaService],
  controllers: [NodeController]
})
export class NodeModule {}
