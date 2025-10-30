import { Module } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { PaymentsController } from './payment.controller';
import { HederaService } from 'src/hedera/hedera.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PaymentsService, HederaService, PrismaService],
  controllers: [PaymentsController]
})
export class PaymentModule {}
