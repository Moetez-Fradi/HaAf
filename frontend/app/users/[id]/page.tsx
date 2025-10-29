'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

type UserDto = {
  id: string;
  email: string;
  displayName?: string | null;
  createdAt?: string;
  walletAccountId?: string | null;
  // any other fields your API returns
};

type ToolDto = {
  id: string;
  name: string;
  description?: string | null;
  rating?: number | null;         // average rating (float)
  reviewsCount?: number | null;   // optional
  usageCount?: number | null;
  fixedPrice?: number | null;
  priceMode?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

type WorkflowDto = {
  id: string;
  name?: string | null;
  description?: string | null;
  fixedUsageFee?: number | null;
  estimatedCost?: number | null;
  createdAt?: string | null;
  usageUrl?: string | null;
  workflowStatus?: string | null;
};

export default function UserShowcasePage() {
  const params = useParams();
  const userId = (params as any).id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);
  const [tools, setTools] = useState<ToolDto[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const tokenString = localStorage.getItem('access_token');
    let token = '';
    if (tokenString) {
      try {
        const parsed = JSON.parse(tokenString);
        token = parsed.state?.token ?? '';
      } catch {
        token = '';
      }
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) user
        const userRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`, { headers });
        setUser(userRes.data.user ?? userRes.data);

        // 2) tools
        const toolsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/tools`, { headers });
        setTools(Array.isArray(toolsRes.data) ? toolsRes.data : (toolsRes.data.tools ?? []));

        // 3) workflows
        const wfRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/workflows`, { headers });
        setWorkflows(Array.isArray(wfRes.data) ? wfRes.data : (wfRes.data.workflows ?? []));

        const nodesRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/nodes`, { headers });
        setNodes(nodesRes.data.nodeCount);
      } catch (err: any) {
        console.error('Failed to fetch user page data', err);
        setError(err?.response?.data?.message ?? err.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  if (!userId) return <div className="p-8">No user id provided</div>;
  if (loading) return <div className="p-8">Loading…</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;
  if (!user) return <div className="p-8">User not found</div>;

  const renderStars = (rating?: number | null) => {
    if (rating === null || rating === undefined) return <span className="text-sm text-gray-400">—</span>;
    const r = Math.max(0, Math.min(5, rating));
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    const stars = Array.from({ length: 5 }).map((_, i) => {
      if (i < full) return <span key={i}>★</span>;
      if (i === full && half) return <span key={i}>☆</span>; // simple half visual (could be improved)
      return <span key={i}>☆</span>;
    });
    return (
      <span className="text-yellow-400 font-medium" title={`${rating.toFixed(2)} / 5`}>
        {stars} <span className="ml-2 text-xs text-gray-300">{rating.toFixed(2)}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-[#050b15] text-white font-inter">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-sm text-gray-400">User</div>
            <h1 className="text-3xl font-bold">{user.displayName ?? user.email}</h1>
            <div className="mt-2 text-sm text-gray-400">
              <span className="font-mono">{user.email}</span> | Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </div>
            {user.walletAccountId && (
              <div className="mt-1 text-sm text-gray-400">Wallet: <span className="font-mono">{user.walletAccountId}</span></div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/workflows')}
              className="px-4 py-2 border rounded border-white/10"
            >
              Browse workflows
            </button>
            <button
              onClick={() => router.push('/tools')}
              className="px-4 py-2 bg-cyan-400 text-black rounded"
            >
              Browse tools
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/6">
            <div className="text-sm text-gray-300">Deployed tools</div>
            <div className="text-2xl font-semibold">{tools.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/6">
            <div className="text-sm text-gray-300">Workflows</div>
            <div className="text-2xl font-semibold">{workflows.length}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/6">
            <div className="text-sm text-gray-300">Initiated nodes</div>
            <div className="text-2xl font-semibold">
              {nodes !== null ? nodes : '0'}
            </div>
          </div>
        </div>

        {/* Tools list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Deployed tools</h2>
            <div className="text-sm text-gray-400">{tools.length} tool(s)</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {tools.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-gradient-to-br from-[#071424]/80 to-[#0a1b2e]/80 border border-white/6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <a
                      href={`/tools/${t.id}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {t.name}
                    </a>
                    <div className="text-sm text-gray-300 mt-1">{t.description ?? 'No description'}</div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-300">
                      <div>Price: {t.fixedPrice != null ? `$${t.fixedPrice}` : '—'}</div>
                      <div>Status: {t.status ?? '—'}</div>
                      <div>Usage: {t.usageCount ?? 0}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div>{renderStars(t.rating)}</div>
                    <a
                      href={`/tools/${t.id}`}
                      className="mt-3 px-3 py-1 bg-cyan-400 text-black rounded text-sm"
                    >
                      View tool
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {tools.length === 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/6 text-gray-400">
                This user has not published any tools yet.
              </div>
            )}
          </div>
        </section>

        {/* Workflows list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Workflows</h2>
            <div className="text-sm text-gray-400">{workflows.length} workflow(s)</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {workflows.map((w) => (
              <div key={w.id} className="p-4 rounded-xl bg-gradient-to-br from-[#071424]/80 to-[#0a1b2e]/80 border border-white/6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <a href={`/workflows/${w.id}`} className="text-lg font-semibold hover:underline">
                      {w.name ?? 'Untitled workflow'}
                    </a>
                    <div className="text-sm text-gray-300 mt-1">{w.description ?? 'No description'}</div>
                    <div className="mt-3 text-sm text-gray-300">
                      Fee: {w.fixedUsageFee != null ? (w.fixedUsageFee === 0 ? 'Free' : `$${w.fixedUsageFee}`) : '—'}
                      {' • '}Estimated: {w.estimatedCost ?? 'unknown'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-300">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}</div>
                    <a href={`/workflows/${w.id}`} className="mt-3 px-3 py-1 bg-cyan-400 text-black rounded text-sm">
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {workflows.length === 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/6 text-gray-400">
                This user has no published workflows yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
