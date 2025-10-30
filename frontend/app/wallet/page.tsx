"use client";
import { useState } from "react";
import connectToWallet from "../../helpers/hashconnect";
import PublicRouteGuard from "../../components/PublicRouteGuard";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3001' 
) as string;

export default function WalletPage() {
  const [pairingString, setPairingString] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAccountId, setWalletAccountId] = useState<string>("");

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setPairingString("");
      console.log("Connecting to wallet...");
      
      const result: any = await connectToWallet();
      console.log("Connection result:", result);
     
      if (result.success && result.pairingString) {
        setPairingString(result.pairingString);
        
        // Listen for pairing event
        if (result.hc) {
          result.hc.pairingEvent.on((pairingData: any) => {
            console.log("Pairing event:", pairingData);
            
            if (pairingData.accountIds && pairingData.accountIds.length > 0) {
              const accountId = pairingData.accountIds[0];
              setWalletAccountId(accountId);
              setIsConnected(true);
              
              // Save to database
              saveWalletToDatabase(accountId);
              
              alert(`Wallet connected successfully! Account: ${accountId}`);
            }
          });
        }
        
        alert("Pairing string generated! Copy it and paste in HashPack wallet, or approve the connection if HashPack opened automatically.");
      } else {
        alert("Failed to connect: " + result.error);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Error connecting to wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const saveWalletToDatabase = async (accountId: string) => {
    try {
      const token = localStorage.getItem('access_token'); 
      
      if (!token) {
        console.error("No auth token found");
        alert("Please log in first before connecting wallet");
        return;
      }

      const response = await fetch(`${API_BASE}/users/link-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walletAccountId: accountId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save wallet to database');
      }

      const data = await response.json();
      console.log("Wallet saved to database:", data);
      
    } catch (error) {
      console.error("Error saving wallet to database:", error);
      alert("Wallet connected but failed to save to database. Please try again.");
    }
  };

  const copyPairingString = () => {
    navigator.clipboard.writeText(pairingString);
    alert("Pairing string copied to clipboard! Now paste it in HashPack wallet.");
  };

  return (
    <PublicRouteGuard blockIfWalletConnected>
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden flex flex-col">
        
      {/* Decorative wave */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-24 h-56 md:h-64 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 pb-20">
        <div className="w-full max-w-2xl">
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
              click on connect to continue
            </p>
          </div>

          {/* Wallet Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl shadow-cyan-500/5">
            {/* Connection Status */}
            {isConnected && walletAccountId && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 font-semibold mb-1">✓ Wallet Connected!</p>
                <p className="text-green-200 text-sm">Account: {walletAccountId}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="border border-cyan-500/40 rounded-xl p-6 text-center bg-cyan-500/10 cursor-pointer hover:bg-cyan-500/20 transition-all">
                <div className="font-semibold text-lg text-white mb-4">Hedera Wallet</div>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting || isConnected}
                  className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? "Generating Pairing Code..." : isConnected ? "Connected" : "Connect"}
                </button>
              </div>
            </div>

            {/* Pairing String Display */}
            {pairingString && !isConnected && (
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-cyan-300 text-sm mb-2">
                  Copy this pairing string and paste it in your HashPack wallet:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/30 p-2 rounded text-cyan-100 text-xs break-all">
                    {pairingString}
                  </code>
                  <button
                    onClick={copyPairingString}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-cyan-400 text-xs mt-2">
                  Or check your HashPack wallet for a connection request
                </p>
              </div>
            )}

            {/* Connection Instructions */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-white font-semibold mb-2">How to connect:</h3>
              <ol className="text-cyan-300 text-sm list-decimal list-inside space-y-1">
                <li>Click the Connect button above</li>
                <li>Copy the pairing string that appears</li>
                <li>Open HashPack wallet and go to "Pair Wallet"</li>
                <li>Paste the pairing string or approve the popup</li>
                <li>Wait for the connection to complete</li>
              </ol>
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
    </PublicRouteGuard>
  );
}