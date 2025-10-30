// src/payments/dto/confirm-payment.dto.ts
import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  instanceId: string;

  @IsString()
  txId: string;
}
