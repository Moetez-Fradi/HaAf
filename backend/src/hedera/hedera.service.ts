// src/hedera/hedera.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import {
  Client,
  Hbar,
  TransferTransaction,
  AccountId,
  PrivateKey,
  TransactionRecordQuery,
  TransactionId,
} from '@hashgraph/sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HederaService {
  private client: Client;
  private readonly logger = new Logger(HederaService.name);

  constructor(private readonly prisma: PrismaService) {
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(process.env.OPERATOR_ID || ''),
      PrivateKey.fromString(process.env.OPERATOR_KEY || '')
    );
  }

  /** Directly transfer HBAR between two accounts. */
  async transferHbar(
    fromAccountId: string,
    toAccountId: string,
    amountHbar: number,
    memo?: string
  ) {
    const tx = new TransferTransaction()
      .addHbarTransfer(fromAccountId, new Hbar(-amountHbar))
      .addHbarTransfer(toAccountId, new Hbar(amountHbar));

    if (memo) tx.setTransactionMemo(memo);

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return {
      txId: response.transactionId.toString(),
      status: receipt.status.toString(),
    };
  }

  /**
   * Fetch the transaction record for a given txId (e.g. "0.0.1234@163....").
   * Returns the raw record object returned by the SDK.
   */
  async getTransactionRecord(txId: string) {
    try {
      const txIdObj = TransactionId.fromString(txId);
      const q = new TransactionRecordQuery().setTransactionId(txIdObj);
      const record = await q.execute(this.client);
      return record;
    } catch (err: any) {
      this.logger.error('Failed to fetch transaction record: ' + (err?.message || err));
      throw new InternalServerErrorException('Failed to fetch transaction record');
    }
  }

  /**
   * Create a single Payment record (receipt) from an enriched graph.
   * - instanceId: unique id (use the same one the frontend will query)
   * - payerWallet: payer's walletAccountId (string)
   * - enrichedGraph: result of enrichGraphWithTools (contains nodes)
   * - memo: optional memo
   *
   * Returns the created Payment DB row.
   */
  async createPaymentReceiptFromGraph(instanceId: string, payerWallet: string, enrichedGraph: any, memo?: string) {
    const nodes = enrichedGraph?.nodes ?? [];
    if (!Array.isArray(nodes) || nodes.length === 0) {
      // Create an empty payment record with zero total (still usable)
      const createdEmpty = await this.prisma.payment.create({
        data: {
          instanceId,
          payer: payerWallet,
          receipt: [],
          total: 0,
          memo: memo ?? null,
        },
      });
      return createdEmpty;
    }

    // Build receipt items from nodes -> tool ownerWallet & usagePrice
    const receiptItems: Array<{ receiver: string; toolName?: string; amount: number }> = [];

    // gather toolIds from nodes and fetch authoritative tool data
    const toolIds = Array.from(new Set(nodes.map((n: any) => n.toolId).filter(Boolean)));
    const tools = await this.prisma.tool.findMany({ where: { id: { in: toolIds } } });
    const toolById = new Map(tools.map(t => [t.id, t]));

    for (const node of nodes) {
      const tool = toolById.get(node.toolId);
      if (!tool) continue;
      const receiver = tool.ownerWallet;
      const amount = Number(tool.usagePrice ?? tool.fixedPrice ?? 0);
      if (!receiver) continue; // skip tools with no owner wallet
      receiptItems.push({ receiver, toolName: tool.name ?? node.name ?? tool.id, amount });
    }

    const total = receiptItems.reduce((s, it) => s + Number(it.amount || 0), 0);

    const created = await this.prisma.payment.create({
      data: {
        instanceId,
        payer: payerWallet,
        receipt: receiptItems as any,
        total,
        memo: memo ?? null,
      },
    });

    return created;
  }

  /**
   * Convenience: create a Payment receipt and (optionally) make the actual transfers using the operator account.
   * This will:
   *  - create the Payment DB row (same as createPaymentReceiptFromGraph)
   *  - if operatorExec === true -> build a single TransferTransaction debiting the operator and crediting each receiver (atomic)
   *  - update the Payment row with txHash and set paid=true if transaction succeeded
   *
   * Use operatorExec=false for non-custodial mode (client pays).
   */
  async payToolOwnersAsOperator(instanceId: string, payerWallet: string, enrichedGraph: any, memo?: string, operatorExec = true) {
    // 1) create receipt row
    const createdPayment = await this.createPaymentReceiptFromGraph(instanceId, payerWallet, enrichedGraph, memo);

    if (!operatorExec) {
      // Not executing transfers from operator; return the created payment
      return { payment: createdPayment };
    }

    // Build a single TransferTransaction from operator -> all receivers
    const receiptItems: Array<{ receiver: string; toolName?: string; amount: number }> = createdPayment.receipt as any[] ?? [];
    const transfersByReceiver: Record<string, number> = {};
    for (const it of receiptItems) {
      if (!it.receiver) continue;
      transfersByReceiver[it.receiver] = (transfersByReceiver[it.receiver] || 0) + Number(it.amount || 0);
    }

    const receivers = Object.keys(transfersByReceiver);
    if (receivers.length === 0) {
      // nothing to pay; return created record unchanged
      return { payment: createdPayment };
    }

    // Construct one TransferTransaction that debits operator and credits each receiver
    let tx = new TransferTransaction();
    const total = Object.values(transfersByReceiver).reduce((s, v) => s + Number(v), 0);

    // operator as payer (negative)
    tx = tx.addHbarTransfer(this.client.operatorAccountId!.toString(), new Hbar(-total));

    for (const r of receivers) {
      const amt = transfersByReceiver[r];
      tx = tx.addHbarTransfer(r, new Hbar(amt));
    }

    if (memo) tx = tx.setTransactionMemo(memo);

    try {
      const response = await tx.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      const txId = response.transactionId.toString();
      const status = receipt.status.toString();

      // If success, mark payment paid and store txHash
      if (status === 'SUCCESS') {
        const updated = await this.prisma.payment.update({
          where: { instanceId: createdPayment.instanceId },
          data: { txHash: txId, paid: true },
        });
        this.logger.log(`Operator paid receipts (tx=${txId}).`);
        return { payment: updated, txId, status };
      } else {
        // mark txHash but leave paid=false
        const updated = await this.prisma.payment.update({
          where: { instanceId: createdPayment.instanceId },
          data: { txHash: txId },
        });
        this.logger.error(`Operator transfer returned status ${status} (tx=${txId})`);
        return { payment: updated, txId, status };
      }
    } catch (err: any) {
      this.logger.error('Operator payout failed: ' + (err?.message || err));
      // leave payment unpaid, record error (optionally store error somewhere)
      return { payment: createdPayment, error: err?.message ?? String(err) };
    }
  }
}
