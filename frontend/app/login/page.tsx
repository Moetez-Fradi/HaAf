'use client';


import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/useUserStore';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:3001' 
) as string;


type AccessToken = { access_token: string, email: string, userId:  string };
const { setUser } = useUserStore.getState();

export default function LoginPage() {
  const router = useRouter();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const validate = () => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    return null;
  };


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }


    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });


      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Login failed';
       
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
       
        throw new Error(errorMessage);
      }


      const data = (await res.json()) as AccessToken;
     
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token);
        setUser(data.access_token, data.email, data.userId);
      }
     
      router.replace('/tools');
     
    } catch (err: any) {
      setError(err?.message ?? 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden flex flex-col">
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
              Sign in to your account
            </h1>
            <p className="text-cyan-400 text-base">
              Access your decentralized AI workspace
            </p>
          </div>


          {/* Form Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl shadow-cyan-500/5">
            {error && (
              <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}


            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>


              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <br></br>


              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
              >
                {isLoading ? 'Signing in…' : 'Secure Login'}
              </button>


              <div className="text-center">
                <p className="text-sm text-cyan-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/signup')}
                    className="font-semibold text-white hover:text-cyan-300 underline underline-offset-4"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>


            <p className="text-center text-sm text-cyan-400 mt-4">
              Forgot password? {' '}
                                <button
                    type="button"
                    className="font-semibold text-white hover:text-cyan-300 underline underline-offset-4"
                  >
                     restore
                  </button>
            </p>
          </div>
        </div>
      </div>


      {/* Footer */}
      <div className="relative z-10 text-center pb-6 px-4">
        <p className="text-xs text-gray-500 leading-relaxed max-w-4xl mx-auto">
          Copyright All Systems are protected. © 2025 AgentHive. All rights reserved.
        </p>
      </div>
    </div>
  );
}




