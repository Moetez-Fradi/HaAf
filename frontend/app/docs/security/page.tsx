'use client';

import Image from 'next/image';

export default function SecurityDocPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Security & Secrets — Implementation</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          This page documents the security features AgentHive currently implements for secrets, node credentials, payments and wallet connectivity.
        </p>
      </header>

      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl font-semibold text-blue-400 mb-4">Implemented goals</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-3">
              <li>Secrets are never stored or transmitted in plaintext to node hosts.</li>
              <li>Node exposure to secrets is short‑lived and auditable.</li>
              <li>Payments and task receipts are recorded on Hedera Consensus Service (HCS) for immutable proof.</li>
              <li>Wallet connections use HashPack / HashConnect with server‑side signature verification.</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6">Architecture overview</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-3 mt-3">
              <li>Secrets and tokens are hashed client/server-side before persisting; DB stores only hashes and metadata.</li>
              <li>When dispatching a job, the backend mints a raw one‑time token and provides it to the node at job start; only the token hash is stored.</li>
              <li>Nodes call <code>POST /run</code> to execute tasks; results are signed by the node and verified by the backend.</li>
              <li>After verification, the backend issues Hedera transfers and publishes a compact receipt to HCS linking taskId, resultHash and paymentTxId.</li>
            </ol>
          </div>

          <div className="space-y-6">

            <div className="p-6 bg-slate-900 rounded-xl border border-white/6">
              <h4 className="text-lg font-semibold text-white">At‑a‑glance</h4>
              <ul className="mt-3 text-gray-300 space-y-2">
                <li><strong>Secret hashing:</strong> per‑secret salt + SHA‑256 (hash and salt stored).</li>
                <li><strong>One‑time tokens:</strong> CSPRNG 256‑bit raw token, stored as SHA‑256 hash, TTL configurable (default 60–300s).</li>
                <li><strong>Node API:</strong> <code>POST /run</code> receives task payload; backend verifies node's ED25519 signature over resultHash.</li>
                <li><strong>HCS receipts:</strong> compact JSON (taskId, resultHash, paymentTxId) published to an HCS topic controlled by the platform.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">Secrets storage (what we store)</h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-white/6">
          <p className="text-gray-300 mb-4">
            The database stores the following minimal fields for each secret: <code>key</code>, <code>salt</code>, <code>hash</code>, <code>ownerId</code>, <code>allowedWorkflows</code>, and timestamps. Raw secret values are never persisted.
          </p>

          <div className="text-sm text-gray-400">
            <p>Secrets can be rotated by creating a new salted hash and updating the workflow mapping; previous hashes are retained for audit.</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">One‑time tokens (what we store & flow)</h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-white/6">
          <p className="text-gray-300 mb-4">
            On job enqueue the platform creates a raw token (CSPRNG), computes SHA‑256(token) and stores the hash with <code>jobId</code>, <code>expiresAt</code>, and a <code>revoked</code> flag. The raw token is shown once to the operator and provided to the node at job start.
          </p>

          <ul className="list-disc list-inside text-gray-300 mt-3 space-y-2">
            <li>Validation compares incoming raw token hashed server‑side with stored hash and checks expiry.</li>
            <li>Revocation flips the <code>revoked</code> flag and prevents further use.</li>
            <li>Tokens have short TTLs (configurable) to limit exposure.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">Run / Verification / Payout flow</h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-white/6">
          <ol className="list-decimal list-inside text-gray-300 space-y-3">
            <li>Node starts job and presents raw one‑time token to backend; backend validates and injects ephemeral secrets into the container environment.</li>
            <li>Node executes and returns a JSON result; node signs the <code>sha256(result)</code> with its ED25519 key and sends signature + result to the backend via <code>POST /run</code>.</li>
            <li>Backend verifies the node signature, verifies expected outputs (if any), then issues Hedera payout transfers and records the payment txId.</li>
            <li>Backend publishes a compact receipt to HCS containing <code>{'{'}taskId,resultHash,paymentTxId{'}'}</code> and stores the HCS sequence mapping for auditability.</li>
          </ol>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">HashPack / HashConnect (wallet flow)</h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-white/6">
          <p className="text-gray-300 mb-4">
            Clients authenticate wallets by signing a server‑generated nonce. The backend verifies the signature and creates a short‑lived session. Before dispatching work we require the user to deposit the agreed HBAR amount to the platform escrow; the deposit is reconciled with HCS receipts.
          </p>

          <ul className="list-disc list-inside text-gray-300 mt-3 space-y-2">
            <li>Server checks the account id and signature before accepting funds.</li>
            <li>Escrow payments are recorded with the corresponding HCS receipt for audit.</li>
          </ul>
        </div>
      </section>

      <section className="mt-12 mb-12">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">Audit records & retention</h2>
        <div className="p-6 rounded-xl bg-slate-900 border border-white/6">
          <p className="text-gray-300 mb-4">
            For every completed task we persist: internal task record, node signature verification result, payment txId, and HCS sequence info. This enables deterministic reconciliation between DB state and HCS receipts.
          </p>

          <div className="text-sm text-gray-400">
            <p>Retention policy and archival are handled by platform config; compact receipts on HCS provide an immutable anchor even after local data archival.</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">References</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="https://docs.hedera.com" className="block p-4 rounded-xl bg-purple-50/5 border border-white/6 hover:scale-[1.01] transition">
            <h5 className="font-semibold text-purple-300">Hedera Docs</h5>
            <p className="text-gray-400 text-sm mt-1">HCS, transfers and SDKs.</p>
          </a>
          <a href="https://hashpack.app" className="block p-4 rounded-xl bg-purple-50/5 border border-white/6 hover:scale-[1.01] transition">
            <h5 className="font-semibold text-purple-300">HashPack</h5>
            <p className="text-gray-400 text-sm mt-1">Wallet used for HashConnect flows.</p>
          </a>
          <a href="https://owasp.org" className="block p-4 rounded-xl bg-purple-50/5 border border-white/6 hover:scale-[1.01] transition">
            <h5 className="font-semibold text-purple-300">OWASP</h5>
            <p className="text-gray-400 text-sm mt-1">Security standards and guidance.</p>
          </a>
        </div>
      </section>
    </div>
  );
}
