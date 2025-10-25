import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterNodeDto } from './dto/node.dto';

@Injectable()
export class NodeService {
  constructor(private prisma: PrismaService) {}

  async registerNode(userId: string, dto: RegisterNodeDto) {
    const { publicKey, capabilities, minPricePerSec, url } = dto;

    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.walletAccountId) {
      throw new Error('You have no wallet linked to your account. Please link a wallet first.');
    }

    let node = await this.prisma.node.findFirst({
      where: { ownerUserId: userId, publicKey },
    });

    if (!node) {
      node = await this.prisma.node.create({
        data: {
          ownerUserId: userId,
          publicKey,
          capabilities,
          minPricePerSec: minPricePerSec || 0,
          url,
          status: 'ONLINE',
        },
      });
    } else {
      node = await this.prisma.node.update({
        where: { id: node.id },
        data: {
          url,
          status: 'ONLINE',
          capabilities,
          minPricePerSec: minPricePerSec || node.minPricePerSec,
        },
      });
    }

    return node;
  }
}
