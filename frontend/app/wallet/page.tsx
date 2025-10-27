"use client";
import connectToWallet from "../../helpers/hashconnect";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3001' 
) as string;

export default function WalletPage() {
  const handleConnect = async () => {
    try {
      console.log("Connecting to wallet...");
      const result: any = await connectToWallet();
      console.log("Connection result:", result);
     
      if (result.success) {
        alert("Wallet connection initiated! Check your HashPack wallet.");
      } else {
        alert("Failed to connect: " + result.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Error connecting to wallet");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <div className="relative z-20 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-cyan-400" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.6"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-white text-xl font-bold">AgentHive</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="#" className="text-gray-300 hover:text-white">Marketplace</a>
          <a href="#" className="text-gray-300 hover:text-white">Builder</a>
          <a href="#" className="text-gray-300 hover:text-white">Dashboard</a>
        </div>
      </div>

      {/* Decorative wave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-24 h-56 md:h-64 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 pb-20">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-cyan-400" fill="none">
                <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="currentColor" opacity="0.8"/>
                <path d="M2 23L16 30L30 23" stroke="currentColor" strokeWidth="2.5"/>
                <path d="M2 16L16 23L30 16" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
              <span className="text-white text-3xl font-bold">AgentHive</span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-3">
              Connect Your Wallet
            </h1>
            <p className="text-cyan-400 text-base">
              Choose your preferred wallet provider to continue
            </p>
          </div>

          {/* Wallet Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl shadow-cyan-500/5">
            <div className="space-y-4">
              <div className="border border-cyan-500/40 rounded-xl p-6 text-center bg-cyan-500/10 cursor-pointer hover:bg-cyan-500/20 transition-all">
                <div className="font-semibold text-lg text-white mb-4">Hedera Wallet</div>
                <button 
                  onClick={handleConnect}
                  className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                >
                  Connect
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-cyan-400">
                Don't have a wallet?{' '}
                <a href="#" className="font-semibold text-white hover:text-cyan-300 underline underline-offset-4">
                  Learn more!
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-gray-500 leading-relaxed max-w-4xl mx-auto">
          Copyright: Will Igorinova or credentials No / Associate to Unknown Libraries • Golden, Ezra / Silicon / Decadal@modules / LinkedIn, see & shadow a blue ▼ / Influence / Available / Access
        </p>
      </div>
    </div>
  );
}