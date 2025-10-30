// src/payments/payments.controller.ts
import { Controller, Post, Body, Get, Param, BadRequestException, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create/init a payment entry.
   * Body: { instanceId, payer, receipt: [{ receiver, toolName, amount }], memo? }
   * If you have authentication, prefer to use authenticated user's wallet as payer instead of body.payer.
   */
  @Post()
  async create(@Body() body: CreatePaymentDto) {
    const { instanceId, payer, receipt, memo } = body;
    if (!instanceId || !payer || !Array.isArray(receipt)) {
      throw new BadRequestException('instanceId, payer and receipt are required');
    }
    const created = await this.paymentsService.createPayment(instanceId, payer, receipt, memo);
    return created;
  }

  /** Fetch a payment/receipt by instanceId */
  @Get(':instanceId')
  async get(@Param('instanceId') instanceId: string) {
    return this.paymentsService.getPaymentByInstance(instanceId);
  }

  /** Confirm payment & try to verify on Hedera */
  @Post('confirm')
  @HttpCode(200)
  async confirm(@Body() body: ConfirmPaymentDto) {
    const { instanceId, txId } = body;
    if (!instanceId || !txId) throw new BadRequestException('instanceId and txId required');
    return this.paymentsService.confirmPayment(instanceId, txId);
  }
}
