'use client';


  import React, { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import PublicRouteGuard from '../../components/PublicRouteGuard';


  const API_BASE = (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:3001' 
  ) as string;


  type AccessToken = { access_token: string };


  export default function SignUpPage() {
    const router = useRouter();


    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const validate = () => {
      if (!email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
      return null;
    };


    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const v = validate();
      if (v) {
        setError(v);
        return;
      }


      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName: displayName || undefined }),
        });


        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Registration failed');
        }


        const data = (await res.json()) as AccessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
        }
        router.replace('/wallet'); 
      } catch (err: any) {
        setError(err?.message ?? 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };


    return (
          <PublicRouteGuard blockIfLoggedIn>
      
      <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden flex flex-col">
        {/* Top Navigation Bar */}
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
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-cyan-400">
                  <path d="M16 2L2 9L16 16L30 9L16 2Z" fill="currentColor" opacity="0.8"/>
                  <path d="M2 23L16 30L30 23" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M2 16L16 23L30 16" stroke="currentColor" strokeWidth="2.5"/>
                </svg>
                <span className="text-white text-3xl font-bold">AgentHive</span>
              </div>
             
              <h1 className="text-4xl font-bold text-white mb-3">
                Create Your AgentHive Account
              </h1>
              <p className="text-cyan-400 text-base">
                Join the decentralized future of AI
              </p>
            </div>


            {/* Form */}
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}


              <form onSubmit={onSubmit} className="space-y-4">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Full Name"
                  autoComplete="name"
                />


                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                />


                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />


                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                />


                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" required />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                  <span className="text-sm text-gray-300">I agree to Terms & Conditions</span>
                </div>


                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                >
                  {isLoading ? 'Creating account…' : 'Create Account'} {/* Fix button text */}
                </button>
              </form>
            </div>
          </div>
        </div>


              <div className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-gray-500 leading-relaxed max-w-4xl mx-auto">
          Copyright All Systems are protected. © 2025 AgentHive. All rights reserved.
        </p>
      </div>
      </div>
      </PublicRouteGuard>
    );
  }

