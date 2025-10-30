'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function HederaDocPage() {
  const [avgMs, setAvgMs] = useState(2000);
  const [avgMemMB, setAvgMemMB] = useState(256);
  const [avgOutBytes, setAvgOutBytes] = useState(2000);
  const [stability, setStability] = useState(0.9);

  const [platformFeePercent, setPlatformFeePercent] = useState(1);
  const [nodeSharePercent, setNodeSharePercent] = useState(70);
  const [hbarUsdRate, setHbarUsdRate] = useState(0.06);

  const cpuPowerW = 25;
  const memPowerW = 0.3 * avgMemMB;
  const energyJ = (avgMs / 1000) * (cpuPowerW + memPowerW);
  const USD_PER_JOULE = 0.000000005;
  const USD_PER_MB = 0.00001;
  const baseCostUSD = energyJ * USD_PER_JOULE + avgMemMB * USD_PER_MB;

  const fixedPriceUSD = baseCostUSD * 1.5;
  const dynamicInputCoeffUSD = baseCostUSD * 0.1;
  const dynamicOutputCoeffUSD = avgOutBytes * 0.0000002;
  const dynamicPriceUSD = baseCostUSD + dynamicInputCoeffUSD + dynamicOutputCoeffUSD;

  const priceMode = stability > 0.8 ? 'FIXED' : 'DYNAMIC';
  const priceUSD = priceMode === 'FIXED' ? fixedPriceUSD : dynamicPriceUSD;
  const priceHBAR = hbarUsdRate > 0 ? priceUSD / hbarUsdRate : 0;

  const platformFeeHBAR = (priceHBAR * platformFeePercent) / 100;
  const remainderHBAR = priceHBAR - platformFeeHBAR;
  const nodePayoutHBAR = (remainderHBAR * nodeSharePercent) / 100;
  const toolOwnerPayoutHBAR = remainderHBAR - nodePayoutHBAR;

  const format = (n : any, d = 6) => Number.isFinite(n) ? n.toFixed(d) : '0.000000';

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-200">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Hedera Integration</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          AgentHive uses Hedera for micro-payments between users, tool owners, and node hosts. The calculator below
          estimates a recommended pricePerCall (in HBAR) from runtime metrics and a simple costing model.
        </p>
      </header>

<section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl font-semibold text-blue-400 mb-4">AgentHive Economy</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              AgentHive is a DePIN + AI-agents & tools marketplace. Developers publish Dockerized AI
              tools, users build workflows, and node hosts execute containers and get paid in HBAR.
              Payments flow through a platform escrow on Hedera Testnet, ensuring trustless
              verification and transparent payouts.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6">High-level flow</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-3 mt-3">
              <li>Wallet connect (HashConnect / HashPack) &amp; deposit HBAR to platform escrow.</li>
              <li>Platform verifies deposit TX and dispatches task to registered node(s).</li>
              <li>Node pulls the Docker image, runs POST /run, computes result and signs the resultHash with ED25519 key.</li>
              <li>Backend verifies the signature, marks task complete, and issues Hedera TransferTransaction to node &amp; tool owner.</li>
            </ol>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-white/5">
              <Image
                src="/docs11.png"
                alt="AgentHive UI example"
                width={1000}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="p-6 bg-slate-900 rounded-xl border border-white/6">
              <h4 className="text-lg font-semibold text-white">Quick facts</h4>
              <ul className="mt-3 text-gray-300 space-y-2">
                <li><strong>Registry:</strong> Supabase stores tools, nodes, workflows and logs.</li>
                <li><strong>Node contract:</strong> POST /run with JSON input, returns {"result"} and signs sha256(result).</li>
                <li><strong>Payouts:</strong> Verified results trigger TransferTransaction with txHash stored in Payments table.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">Tool Pricing calculator (live)</h2>
        <p>The tool creator sets a usage price for workflow builder, but to 
          ensure fairness he can't set the price for the node hosts that will run his tool:
          he can set it too high and expensive for users or too low and the nodes will be loosing money.
          That's why we came with an innovative idea: when deploying a tool, our server calcualtes 
          the price based on memory + cpu usage for different runs and output lenghts!
        </p>
        <br></br>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 p-6 rounded-xl bg-slate-900 border border-white/6">
            <label className="block text-sm text-gray-300">Average runtime (ms)</label>
            <input type="number" step="1" value={avgMs} onChange={(e) => setAvgMs(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />

            <label className="block text-sm text-gray-300">Average memory (MB)</label>
            <input type="number" step="1" value={avgMemMB} onChange={(e) => setAvgMemMB(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />

            <label className="block text-sm text-gray-300">Average response size (bytes)</label>
            <input type="number" step="1" value={avgOutBytes} onChange={(e) => setAvgOutBytes(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />

            <label className="block text-sm text-gray-300">Stability (0-1)</label>
            <input type="number" step="0.01" min="0" max="1" value={stability} onChange={(e) => setStability(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />

            <label className="block text-sm text-gray-300">HBAR ↔ USD rate (USD per HBAR)</label>
            <input type="number" step="0.0001" value={hbarUsdRate} onChange={(e) => setHbarUsdRate(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />

            <label className="block text-sm text-gray-300">Platform fee (%)</label>
            <input type="number" step="0.1" value={platformFeePercent} onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />

            <label className="block text-sm text-gray-300">Node share of remainder (%)</label>
            <input type="number" step="1" value={nodeSharePercent} onChange={(e) => setNodeSharePercent(parseFloat(e.target.value || '0'))}
              className="mt-1 w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white" />
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-white/6">
            <h4 className="text-xl font-semibold text-white mb-3">Estimated pricing</h4>
            <div className="text-gray-300 space-y-2">
              <p>Price mode: <span className="text-white">{priceMode}</span></p>
              <p>Estimated cost (USD): <span className="text-white">${format(priceUSD, 6)}</span></p>
              <p>Suggested price per call: <span className="text-white">{format(priceHBAR, 6)} HBAR</span></p>
              <p>Platform fee: <span className="text-white">{format(platformFeeHBAR, 6)} HBAR</span></p>
              <p>Node payout: <span className="text-white">{format(nodePayoutHBAR, 6)} HBAR</span></p>
              <p>Tool owner payout: <span className="text-white">{format(toolOwnerPayoutHBAR, 6)} HBAR</span></p>
            </div>

            <div className="mt-6 text-sm text-gray-400">
              <p>
                The estimator converts compute time, memory footprint and bandwidth into a base USD cost, then
                applies a fixed multiplier or a dynamic formula depending on stability. Use these values as a starting point
                and adjust platform fee / payouts to your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">Economic & incentive ideas</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 rounded-xl border border-white/6">
            <h4 className="text-lg font-semibold text-white">1. Reputation & staking</h4>
            <p className="text-gray-300 mt-3">
              Require node operators to stake a small bond or register with identity: misbehavior reduces reputation and may hurt payouts.
            </p>
          </div>

          <div className="p-6 bg-slate-900 rounded-xl border border-white/6">
            <h4 className="text-lg font-semibold text-white">2. Dynamic pricing</h4>
            <p className="text-gray-300 mt-3">
              Allow tool owners to set usage price for their tools and we automatically test and calculate the fair price for nodes to run them.
            </p>
          </div>

          <div className="p-6 bg-slate-900 rounded-xl border border-white/6">
            <h4 className="text-lg font-semibold text-white">3. Fraud prevention</h4>
            <p className="text-gray-300 mt-3">
              Use signed resultHashes and random challenge inputs for spot checks. Environment variables are encrypted in the database.
            </p>
          </div>

          <div className="p-6 bg-slate-900 rounded-xl border border-white/6">
            <h4 className="text-lg font-semibold text-white">4. Transparency</h4>
            <p className="text-gray-300 mt-3">
              Provide TX links, task logs, and receipts for each payout so users can audit payments on Hedera Testnet.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 mb-12">
        <h2 className="text-3xl font-semibold text-blue-400 mb-4">Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="https://docs.hedera.com" className="block p-4 rounded-xl bg-purple-50/5 border border-white/6 hover:scale-[1.01] transition">
            <h5 className="font-semibold text-purple-300">Hedera Documentation</h5>
            <p className="text-gray-400 text-sm mt-1">API reference, SDKs, and token standards.</p>
          </a>
          <a href="https://hashpack.app" className="block p-4 rounded-xl bg-purple-50/5 border border-white/6 hover:scale-[1.01] transition">
            <h5 className="font-semibold text-purple-300">HashPack Wallet</h5>
            <p className="text-gray-400 text-sm mt-1">Wallet used for HashConnect &amp; testnet accounts.</p>
          </a>
          <a href="https://portal.hedera.com" className="block p-4 rounded-xl bg-purple-50/5 border border-white/6 hover:scale-[1.01] transition">
            <h5 className="font-semibold text-purple-300">Hedera Portal</h5>
            <p className="text-gray-400 text-sm mt-1">Network status and explorer for transactions.</p>
          </a>
        </div>
      </section>
    </div>
  );
}
