'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Workflow {
  id: string;
  name: string;
  description: string;
  ownerUserId: string;
  graphJson: any;
  fixedUsageFee: number;
  workflowStatus: string;
  createdAt: string;
  owner: any
}

export default function WorkflowsPage() {
    const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['Testing', 'Deployed', 'Archived'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadWorkflows();
  }, [searchQuery, selectedCategory, sortBy]);

  const loadWorkflows = async () => {
    setLoading(true);
    try {

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/workflows`;
      console.log
      const res = await axios.get(url);
      let data: Workflow[] = res.data.workflows || [];

      console.log('Fetched workflows:', res.data);
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(
          wf => JSON.stringify(wf.graphJson).toLowerCase().includes(q) || wf.id.toLowerCase().includes(q)
        );
      }

      if (selectedCategory !== 'all') {
        data = data.filter(wf => wf.workflowStatus.toLowerCase() === selectedCategory.toLowerCase());
      }

      data = sortWorkflows(data, sortBy);
      setWorkflows(data);
      console.log('Loaded workflows:', data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const sortWorkflows = (data: Workflow[], sortType: string) => {
    const sorted = [...data];
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'fee-low':
        return sorted.sort((a, b) => a.fixedUsageFee - b.fixedUsageFee);
      case 'fee-high':
        return sorted.sort((a, b) => b.fixedUsageFee - a.fixedUsageFee);
      case 'status':
        return sorted.sort((a, b) => a.workflowStatus.localeCompare(b.workflowStatus));
      default:
        return sorted;
    }
  };

  const handleSearch = () => setSearchQuery(searchInput);
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden px-8 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <h1 className="text-4xl font-bold text-white mb-6">
        Workflows
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all font-medium"
          >
            Search
          </button>
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="rounded-xl bg-[#1a1b26] border border-white/20 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
        >
          <option value="newest">Newest</option>
          <option value="fee-low">Fee: Low to High</option>
          <option value="fee-high">Fee: High to Low</option>
        </select>
    <button
      onClick={() => router.push('/workflows/build')}
      className="rounded-xl bg-[#1a1b26] bg-cyan-500 border border-white/20 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
    >
      Create your own!
    </button>
      </div>

      {/* Workflows Grid */}
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : workflows.length === 0 ? (
        <p className="text-gray-400">No workflows found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflows.map(wf => (
  <Link key={wf.id} href={`/workflows/${wf.id}`} className="block">
    <div className="bg-white/5 p-6 rounded-2xl hover:bg-cyan-500/10 transition-all cursor-pointer">
      <h2 className="text-xl font-bold mb-2">{wf.name}</h2>
      <p>Description: {wf.description || 'Not specified'}</p>
      <p>Owner: {wf.owner.displayName}</p>
      <p>Fee: {wf.fixedUsageFee === 0 ? 'Free' : `$${wf.fixedUsageFee}`}</p>
    </div>
  </Link>
))}
        </div>
      )}
    </div>
  );
}
