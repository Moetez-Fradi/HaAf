'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CreateToolForm {
  name: string;
  description: string;
  dockerImageUrl: string;
  requiredEnv: string[];
  inputShape: string;
  outputShape: string;
  currentEnvVar: string;
  usagePrice: number; 
}

const API_BASE = 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('access_token');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);
      return parsed?.state?.token || null;
    } catch (e) {
      console.error('Failed to parse access_token:', e);
      return null;
    }
  } 
  return null;
};
export default function CreateToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState<CreateToolForm>({
  name: '',
  description: '',
  dockerImageUrl: '',
  requiredEnv: [],
  inputShape: '',
  outputShape: '',
  currentEnvVar: '',
  usagePrice: 0, 
});


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in to create a tool');
        return;
      }
      const payload = {
        name: formData.name,
        description: formData.description,
        dockerImageUrl: formData.dockerImageUrl,
        requiredEnv: formData.requiredEnv,
        inputShape: formData.inputShape || 'Not specified',
        outputShape: formData.outputShape || 'Not specified',
        usagePrice: formData.usagePrice,
      };

      const response = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create tool');
      }

      const tool = await response.json();
      router.push(`/tools/${tool.id}/test`);
      
    } catch (error) {
      console.error('Error creating tool:', error);
      alert(error instanceof Error ? error.message : 'Failed to create tool');
    } finally {
      setLoading(false);
    }
  };

  const addEnvVar = () => {
    if (formData.currentEnvVar.trim() && !formData.requiredEnv.includes(formData.currentEnvVar.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredEnv: [...prev.requiredEnv, prev.currentEnvVar.trim()],
        currentEnvVar: ''
      }));
    }
  };

  const removeEnvVar = (envVar: string) => {
    setFormData(prev => ({
      ...prev,
      requiredEnv: prev.requiredEnv.filter(env => env !== envVar)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEnvVar();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 px-8 py-8 max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link 
          href="/tools"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Tools
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Create <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">New Tool</span>
          </h1>
          <p className="text-xl text-cyan-400 max-w-2xl mx-auto leading-relaxed">
            Build and deploy your AI tool to the decentralized network. Share your innovation with the community.
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                <path d="M12 15l-4.243-4.243m8.486 0L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-white font-bold mb-2">Easy Deployment</h3>
            <p className="text-gray-400 text-sm">
              Deploy your Docker container seamlessly to our decentralized network
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
                </div>
            <h3 className="text-white font-bold mb-2">Earn & Win</h3>
            <p className="text-gray-400 text-sm">
                  Launch your tool, attract users, and earn rewards! 
    
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-400">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-white font-bold mb-2">Join Community</h3>
            <p className="text-gray-400 text-sm">
              Become part of our growing ecosystem of AI tool builders
            </p>
          </div>
        </div>
        <br></br>

        {/* Creation Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tool Name */}
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-3">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter a unique name for your tool"
                    className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-3">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your tool does, its capabilities, and use cases..."
                    rows={4}
                    className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Docker Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-white font-semibold mb-3">
                    Docker Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dockerImageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, dockerImageUrl: e.target.value }))}
                    placeholder="e.g., your-username/your-tool:latest"
                    className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
                            <div>
  <label className="block text-white font-semibold mb-3">
    Usage Price ($)
  </label>
  <input
    type="number"
    required
    min={0}
    value={formData.usagePrice}
    onChange={(e) =>
      setFormData(prev => ({ ...prev, usagePrice: Number(e.target.value) }))
    }
    placeholder="Set the usage price for your tool"
    className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
  />
</div>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                Technical Specifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Shape */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Input Shape
                  </label>
                  <textarea
                    value={formData.inputShape}
                    onChange={(e) => setFormData(prev => ({ ...prev, inputShape: e.target.value }))}
                    placeholder="Describe the expected input format (JSON schema, data types, etc.)"
                    rows={3}
                    className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                  />
                </div>



                {/* Output Shape */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Output Shape
                  </label>
                  <textarea
                    value={formData.outputShape}
                    onChange={(e) => setFormData(prev => ({ ...prev, outputShape: e.target.value }))}
                    placeholder="Describe the output format (JSON schema, data types, etc.)"
                    rows={3}
                    className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                Environment Variables
              </h3>
              
              <div className="space-y-4">
                <label className="block text-white font-semibold">
                  Required Environment Variables
                </label>
                
                {/* Add Environment Variable */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={formData.currentEnvVar}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentEnvVar: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., API_KEY, DATABASE_URL, SECRET_TOKEN"
                    className="flex-1 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={addEnvVar}
                    className="px-6 py-4 rounded-xl bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30 transition-all font-semibold whitespace-nowrap"
                  >
                    Add Variable
                  </button>
                </div>

                {/* Environment Variables List */}
                {formData.requiredEnv.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="text-white font-semibold mb-3">Added Variables:</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.requiredEnv.map((envVar, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-400/30"
                        >
                          <span>{envVar}</span>
                          <button
                            type="button"
                            onClick={() => removeEnvVar(envVar)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-gray-400 text-sm">
                  These environment variables will be required when users deploy your tool. 
                  Users will provide their own values for these variables.
                </p>
              </div>
            </div>



            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Tool...
                  </div>
                ) : (
                  'Create Tool'
                )}
              </button>
              
              <Link
                href="/tools"
                className="px-8 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}