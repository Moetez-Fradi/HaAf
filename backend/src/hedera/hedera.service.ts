import { Injectable } from '@nestjs/common';
import { Client, Hbar, TransferTransaction, AccountId, PrivateKey } from "@hashgraph/sdk";

@Injectable()
export class HederaService {
  private client: Client;

  constructor() {
    this.client = Client.forTestnet();
    this.client.setOperator(
      AccountId.fromString(process.env.OPERATOR_ID || ""),
      PrivateKey.fromString(process.env.OPERATOR_KEY || "")
    );
  }

  async payHbar(to: string, amount: number, memo?: string) {
    const tx = new TransferTransaction()
      .addHbarTransfer(this.client.operatorAccountId!, new Hbar(-amount))
      .addHbarTransfer(to, new Hbar(amount));

    if (memo) tx.setTransactionMemo(memo);

    const response = await tx.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    return receipt;
  }
}

export const USD_TO_HBAR = 10;
