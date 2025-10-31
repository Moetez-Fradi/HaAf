'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Hbar, TransferTransaction, TransactionId, AccountId } from "@hashgraph/sdk";
import { HashConnect } from "hashconnect";
import { useUserStore } from '../../../../store/useUserStore';

const STORAGE_KEY = 'agenthive_hashconnect_v1';
const NETWORK = 'testnet';

function loadSaved() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
}
function saveSaved(obj: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

async function connectToWallet() {
  const hc = new HashConnect();
  const appMetadata = {
    name: 'AgentHive PoC',
    description: 'AgentHive payment PoC',
    icon: 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png',
    url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
  };

  const saved = loadSaved();
  let initData: any;
  if (saved?.privKey) {
    try { initData = await hc.init(appMetadata, saved.privKey); } catch { initData = await hc.init(appMetadata); }
  } else {
    initData = await hc.init(appMetadata);
  }

  if (initData?.privKey) saveSaved({ ...saved, privKey: initData.privKey, topic: initData.topic ?? saved?.topic ?? null });

  let pairedResolve: (v: any) => void;
  const pairedPromise = new Promise<any>((resolve) => { pairedResolve = resolve; });

  hc.pairingEvent.on((pairingData: any) => {
    const s = loadSaved() || {};
    if (pairingData.topic) { s.topic = pairingData.topic; saveSaved(s); }
    if (pairingData.accountIds?.length) {
      s.accountIds = pairingData.accountIds;
      saveSaved(s);
      pairedResolve(pairingData);
    }
  });

  const state = await hc.connect();
  hc.findLocalWallets();
  const pairingString = hc.generatePairingString(state, NETWORK, false);

  if (saved?.accountIds?.length) {
    return { success: true, hc, pairingString, pairedPromise, pairingData: { accountIds: saved.accountIds, topic: saved.topic } };
  }

  return { success: true, hc, pairingString, pairedPromise, pairingData: null };
}

type Payout = { receiver: string; amount: number; toolName?: string };
type Payment = { instanceId: string; receipt: Payout[]; total: number; memo?: string; paid: boolean; txHash?: string };

export default function PayPage() {
  const params = useParams();
  const instanceId = params?.id as string | undefined;
  const router = useRouter();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [txResult, setTxResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hc, setHc] = useState<any | null>(null);
  const [pairingString, setPairingString] = useState<string | null>(null);
  const [pairedPromise, setPairedPromise] = useState<Promise<any> | null>(null);
  const [pairingData, setPairingData] = useState<any | null>(null);

  const { userId, token } = useUserStore.getState();

  useEffect(() => {
    if (!instanceId) return;
    const saved = sessionStorage.getItem(`payment_${instanceId}`);
    if (saved) {
      try { setPayment(JSON.parse(saved)); setLoading(false); return; } catch {}
    }
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get<Payment>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/${instanceId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        setPayment(res.data);
        try { sessionStorage.setItem(`payment_${instanceId}`, JSON.stringify(res.data)); } catch {}
      } catch (err: any) {
        console.error('Failed to load payment', err);
        setError('Failed to load payment receipt');
      } finally { setLoading(false); }
    })();
  }, [instanceId, token]);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await connectToWallet();
        if (res?.hc) setHc(res.hc);
        if (res?.pairingString) setPairingString(res.pairingString);
        if (res?.pairedPromise) setPairedPromise(res.pairedPromise);
        if (res?.pairingData) setPairingData(res.pairingData);
        if (!res?.pairingData && res?.pairedPromise) {
          const pd = await res.pairedPromise;
          setPairingData(pd);
        }
      } catch (err) {
        console.error('HashConnect init failed', err);
      }
    })();
  }, []);

  async function finalizePayment(txId: string | undefined) {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/confirm-payments`, { instanceId: payment?.instanceId, txId }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      alert('Payment confirmed. Server response: ' + JSON.stringify(res.data?.message ?? res.data));
      router.push(`/workflows/${res.data?.workflowId ?? ''}` || `/workflows`);
    } catch (err) {
      console.error('Failed to finalize payment', err);
      throw err;
    }
  }

  const computeTotal = (p: Payout[]) => p.reduce((sum, x) => sum + Number(x.amount || 0), 0);

async function doPay() {
  if (!payment?.receipt || payment.receipt.length === 0) {
    alert("Nothing to pay");
    return;
  }

  setPaying(true);
  setError(null);

  try {
    console.log("starting payment flow");
    if (!hc) throw new Error("HashConnect not initialized");

    let pd = pairingData;
    console.log("pairing data:", pd);
    if (!pd) {
      if (!pairedPromise) throw new Error("Wallet not paired and no pairing flow available");
      console.log("awaiting");
      pd = await pairedPromise;
      setPairingData(pd);
    }

    if (!pd?.accountIds?.length) throw new Error("No account id available from wallet");
    const fromId = pd.accountIds[0];
    if (!fromId || typeof fromId !== "string") throw new Error("Invalid account id");

    console.log("paying from:", fromId);

    const total =
      payment.total ?? payment.receipt.reduce((s, it) => s + Number(it.amount || 0), 0);
    if (total <= 0) throw new Error("Nothing to pay");

    const byReceiver: Record<string, number> = {};
    for (const it of payment.receipt) {
      if (!it.receiver) continue;
      byReceiver[it.receiver] = (byReceiver[it.receiver] || 0) + Number(it.amount || 0);
    }

    console.log("aggregated recipients:", byReceiver);

    const tx = new TransferTransaction();
    // tx.setTransactionId(TransactionId.generate(AccountId.fromString(fromId))); // ✅
    tx.addHbarTransfer(fromId, new Hbar(-total));

    for (const r of Object.keys(byReceiver))
      tx.addHbarTransfer(r, new Hbar(byReceiver[r]));

    if (payment.memo) tx.setTransactionMemo(payment.memo);

    console.log("prepared tx:", tx);

    // ✅ Properly build signer with account + topic
      if (!pd.topic) throw new Error("Pairing topic missing");
    const provider = hc.getProvider(NETWORK, pd.topic, fromId);
    const signer = hc.getSigner(provider);
    if (!signer) throw new Error("Signer not available from HashConnect");

    console.log("signer:", signer);

    console.log("before freeze:", tx.transactionId?.toString?.());
    await tx.freezeWithSigner(signer);
    console.log("after freeze");

    const txResponse = await tx.executeWithSigner(signer);
    console.log("txResponse:", txResponse);

    setTxResult(txResponse);
    console.log("finalizing payment...");
    try {
      await finalizePayment(tx.transactionId?.toString());
    } catch (err) {
      console.warn("Finalize payment failed, transaction executed", err);
    }

    setPaying(false);
  } catch (err: any) {
    console.error("Payment failed", err);
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

      {pairingString && !pairingData && (
        <div className="mb-4 p-3 bg-yellow-50 rounded">
          <div className="text-sm text-gray-700 mb-2">Pair your wallet (copy/paste pairing string into HashPack or scan QR)</div>
          <textarea readOnly value={pairingString} className="w-full p-2 font-mono text-xs" rows={3} />
        </div>
      )}

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
              <div className="text-sm text-gray-300">Total: <span className="font-mono">{computeTotal(payment.receipt)} HBAR</span></div>
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
              <button onClick={doPay} disabled={paying} className="px-4 py-2 bg-yellow-400 text-black rounded">
                {paying ? 'Processing payment…' : `Pay ${computeTotal(payment.receipt)} HBAR`}
              </button>

              <button onClick={() => router.push(`/workflows/testing/${payment.instanceId ?? ''}`)} className="px-4 py-2 border rounded">
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
