'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import connectToWallet from '../../../../helpers/hashconnect';
import { TransferTransaction, Hbar } from '@hashgraph/sdk';
import { useUserStore } from '../../../../store/useUserStore';

type Payout = {
  receiver: string;
  amount: number;
  toolName?: string;
};

type Payment = {
  instanceId: string;
  receipt: Payout[];
  total: number;
  memo?: string;
  paid: boolean;
  txHash?: string;
};

interface HashConnectPairing {
  topic: string;
  accountIds: string[];
  metadata: {
    name: string;
    description?: string;
    icon?: string;
    url?: string;
  };
}

export default function PayPage() {
  const params = useParams();
  const instanceId = params?.id as string | undefined;
  const router = useRouter();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [txResult, setTxResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { userId, token } = useUserStore.getState();

  // Load payment from backend
  useEffect(() => {
    if (!instanceId) return;

    const saved = sessionStorage.getItem(`payment_${instanceId}`);
    if (saved) {
      try {
        setPayment(JSON.parse(saved));
        setLoading(false);
        return;
      } catch {}
    }

    (async () => {
      setLoading(true);
      try {
        const res = await axios.get<Payment>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/receipt/${instanceId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setPayment(res.data);
      } catch (err: any) {
        console.error('Failed to load payment', err);
        setError('Failed to load payment receipt');
      } finally {
        setLoading(false);
      }
    })();
  }, [instanceId, token]);

  async function finalizePayment(txId: string | undefined) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/confirm-payments`,
      { instanceId: payment?.instanceId, txId },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    alert('Payment confirmed. Server response: ' + JSON.stringify(res.data?.message ?? res.data));
    router.push(`/workflows/${res.data?.workflowId ?? ''}` || `/workflows`);
  } catch (err) {
    console.error('Failed to finalize payment', err);
    throw err;
  }
}

  const computeTotal = (p: Payout[]) =>
    p.reduce((sum, x) => sum + Number(x.amount || 0), 0);

  async function doPay() {
  if (!payment?.receipt || payment.receipt.length === 0) {
    alert('Nothing to pay');
    return;
  }

  setPaying(true);
  setError(null);

  try {
    if (!userId) throw new Error('No user logged in');

    // Fetch payer wallet accountId from backend
    const userRes = await axios.get<{ user: { walletAccountId?: string } }>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    const accountId = userRes.data?.user?.walletAccountId;
    if (!accountId) throw new Error('User does not have a walletAccountId on file');

    // Connect to wallet (HashConnect)
    const { success, hc, pairingString, pairedPromise } = await connectToWallet();
    if (!success || !hc) throw new Error('Wallet connect failed');

    console.log('Pairing string (show this QR to wallet or use local wallet):', pairingString);

    // Wait for wallet to pair and cast to proper type
    const pairingData = (await pairedPromise) as any;
    console.log('Wallet paired', pairingData);

    // Build transaction
    const total = payment.total ?? payment.receipt.reduce((sum, x) => sum + (x.amount || 0), 0);
    let tx = new TransferTransaction();

    // Debit payer
    tx = tx.addHbarTransfer(accountId, new Hbar(-total));

    // Credit each recipient (grouped by receiver)
    const byReceiver: Record<string, number> = {};
    for (const item of payment.receipt) {
      if (!item.receiver) continue;
      byReceiver[item.receiver] = (byReceiver[item.receiver] || 0) + Number(item.amount || 0);
    }
    for (const r of Object.keys(byReceiver)) {
      tx = tx.addHbarTransfer(r, new Hbar(byReceiver[r]));
    }

    if (payment.memo) tx = tx.setTransactionMemo(payment.memo);

    // Get signer from HashConnect (pass HashConnectProvider)
    const signer = hc.getSigner(pairingData);
    if (!signer) throw new Error('Signer not available from HashConnect');

    // Execute transaction
    // @ts-ignore
    await (tx as any).freezeWithSigner?.(signer);
    // @ts-ignore
    const txResponse = await (tx as any).executeWithSigner?.(signer);
    const txId = txResponse?.transactionId?.toString?.() ?? txResponse?.toString?.();

    console.log('Transaction successful', txId);
    setTxResult(txResponse);

    // Finalize payment on backend
    await finalizePayment(txId); // <-- you must define this in your file

    setPaying(false);
  } catch (err: any) {
    console.error('Payment failed', err);
    setError(err?.message ?? String(err));
    setPaying(false);
  }
}


  if (!instanceId) return <div className="p-6">Missing instance id</div>;
  if (loading) return <div className="p-6">Loading payment details…</div>;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Confirm Payment</h1>
      {error && <div className="mb-4 text-red-400">{error}</div>}
      {!payment && <div className="text-gray-400">No payment receipt found.</div>}

      {payment && (
        <>
          <div className="mb-4 bg-[#071424] border border-white/6 rounded p-4">
            <div className="text-sm text-gray-300">Instance</div>
            <div className="font-mono">{payment.instanceId}</div>
            <div className="text-sm text-gray-300 mt-2">Memo</div>
            <div className="font-mono">{payment.memo ?? '-'}</div>
          </div>

          <div className="bg-[#071424] border border-white/6 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-300">Recipients</div>
              <div className="text-sm text-gray-300">
                Total: <span className="font-mono">{computeTotal(payment.receipt)} HBAR</span>
              </div>
            </div>

            <ul className="space-y-2">
              {payment.receipt.map((p, i) => (
                <li key={i} className="flex items-center justify-between p-2 bg-[#0b1620] rounded">
                  <div>
                    <div className="font-semibold">{p.toolName ?? p.receiver}</div>
                    <div className="text-xs text-gray-400">{p.receiver}</div>
                  </div>
                  <div className="font-mono">{p.amount} HBAR</div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <button
                onClick={doPay}
                disabled={paying}
                className="px-4 py-2 bg-yellow-400 text-black rounded"
              >
                {paying ? 'Processing payment…' : `Pay ${computeTotal(payment.receipt)} HBAR`}
              </button>

              <button
                onClick={() => router.push(`/workflows/testing/${payment.instanceId ?? ''}`)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {txResult && (
        <div className="mt-6 bg-[#071424] border border-white/6 rounded p-4">
          <div className="text-sm text-gray-300">Transaction result</div>
          <pre className="font-mono whitespace-pre-wrap">{JSON.stringify(txResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
