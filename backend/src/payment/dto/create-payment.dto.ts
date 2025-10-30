// src/payments/dto/create-payment.dto.ts
import { IsString, IsArray, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ReceiptItem {
  @IsString()
  receiver: string;

  @IsOptional()
  @IsString()
  toolName?: string;

  @IsNumber()
  amount: number;
}

export class CreatePaymentDto {
  @IsString()
  instanceId: string;

  @IsString()
  payer: string; // walletAccountId (or backend can override with authenticated user)

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItem)
  receipt: ReceiptItem[];

  @IsOptional()
  @IsNumber()
  total?: number; // optional; server will compute if missing

  @IsOptional()
  @IsString()
  memo?: string;
}
