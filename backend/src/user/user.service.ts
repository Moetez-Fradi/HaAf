import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hash },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async linkWallet(userId: string, wallet: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { wallet },
    });
  }
}
