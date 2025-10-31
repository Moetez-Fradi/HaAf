import { Module } from '@nestjs/common';
import { HederaService } from './hedera.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payment/payment.service';

@Module({
  providers: [HederaService, PrismaService, PaymentsService]
})
export class HederaModule {}
