import { Module } from '@nestjs/common';
import { HederaService } from './hedera.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentsService } from 'src/payment/payment.service';

@Module({
  providers: [HederaService, PrismaService, PaymentsService]
})
export class HederaModule {}
