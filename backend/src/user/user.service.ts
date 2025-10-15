import { Injectable } from '@nestjs/common';
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

  async findByEmailNoPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, password: false, email: true, displayName: true, walletAccountId: true },
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
}
