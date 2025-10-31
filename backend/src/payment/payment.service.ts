// src/payments/payments.service.ts
import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HederaService } from '../hedera/hedera.service';

type ReceiptItem = { receiver: string; toolName?: string; amount: number };

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private hedera: HederaService) {}

  /** Create and persist a single Payment (receipt contains array). */
  async createPayment(instanceId: string, payer: string, receipt: ReceiptItem[], memo?: string) {
    if (!instanceId) throw new BadRequestException('instanceId required');
    if (!payer) throw new BadRequestException('payer required');
    if (!Array.isArray(receipt)) throw new BadRequestException('receipt must be an array');

    const total = typeof receipt.reduce === 'function'
      ? receipt.reduce((s, it) => s + Number(it.amount || 0), 0)
      : 0;

    // upsert style: if instanceId already exists, throw or return existing
    const existing = await this.prisma.payment.findUnique({ where: { instanceId } });
    if (existing) {
      // choose behavior: return existing (avoid duplicate)
      return existing;
    }

    const created = await this.prisma.payment.create({
      data: {
        instanceId,
        payer,
        receipt: receipt as any,
        total,
        memo: memo ?? null,
      },
    });

    return created;
  }

  /** Fetch stored payment by instanceId */
  async getPaymentByInstance(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /**
   * Confirm payment: store txHash and try to verify Hedera transfers match the receipt.
   * If verification succeeds => set paid=true. If verification not possible or fails => store txHash and paid=false.
   */
  async confirmPayment(instanceId: string, txId: string) {
    if (!instanceId || !txId) throw new BadRequestException('instanceId and txId required');

    const payment = await this.prisma.payment.findUnique({ where: { instanceId } });
    if (!payment) throw new NotFoundException('Payment not found');

    // default: not verified
    let verified = false;
    try {
      if (this.hedera?.getTransactionRecord) {
        const record: any = await this.hedera.getTransactionRecord(txId);

        // Normalise transfer list into map { '0.0.x': amountInHBAR }
        const transfers: Record<string, number> = {};

        // attempt several common shapes
        const transferList = record?.transferList ?? record?.transfers ?? record?.transfersList ?? null;

        if (Array.isArray(transferList)) {
          for (const t of transferList) {
            const accountId = t?.accountId ?? t?.account;
            let amount = t?.amount ?? t?.amountHbar ?? 0;
            amount = Number(amount);

            // heuristic: if amount looks very large (>= 1e6) treat as tinybars and convert
            if (Math.abs(amount) > 1e6) {
              amount = amount / 100_000_000; // tinybars -> HBAR
            }
            transfers[accountId] = (transfers[accountId] || 0) + amount;
          }
        } else if (transferList && typeof transferList === 'object') {
          // object map
          for (const k of Object.keys(transferList)) {
            let amt = Number(transferList[k] ?? 0);
            if (Math.abs(amt) > 1e6) amt = amt / 100_000_000;
            transfers[k] = (transfers[k] || 0) + amt;
          }
        }

        // compare expected amounts
        const expected = (payment.receipt as ReceiptItem[] || []).map(it => ({
          receiver: it.receiver,
          amount: Number(it.amount || 0),
        }));

        let allOk = true;
        for (const e of expected) {
          const got = transfers[e.receiver] ?? 0;
          // allow small epsilon
          if (got + 1e-9 < e.amount) {
            allOk = false;
            break;
          }
        }
        verified = allOk;
      }
    } catch (err) {
      // verification attempt failed — we still record txHash below
      console.warn('Hedera verification error:', err?.message ?? err);
      verified = false;
    }

    const updated = await this.prisma.payment.update({
      where: { instanceId },
      data: {
        txHash: txId,
        paid: verified ? true : false,
      },
    });

    return {
      success: true,
      instanceId: updated.instanceId,
      txHash: updated.txHash,
      paid: updated.paid,
      verified,
      total: updated.total,
      receipt: updated.receipt,
    };
  }
}
