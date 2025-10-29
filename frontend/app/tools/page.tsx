// app/tools/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  description: string;
  dockerImageUrl: string;
  usagePrice: number;
  status: string;
  rating?: number;
  inputShape: string;
  outputShape: string;
}

const API_BASE = 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

const toolsApi = {
  getTools: async (page: number = 1) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/tools?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch tools');
    return response.json();
  },
};

const StarRating = ({ rating = 0 }: { rating?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          );
        } else if (i === fullStars && hasHalfStar) {
          return (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" className="text-yellow-400">
              <defs>
                <linearGradient id="half-star">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path fill="url(#half-star)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          );
        } else {
          return (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          );
        }
      })}
      <span className="text-gray-400 text-sm ml-1">({rating.toFixed(1)})</span>
    </div>
  );
};

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    'Image Processing',
    'Natural Language', 
    'Audio Processing',
  ];

  useEffect(() => {
    loadTools();
  }, [searchQuery, selectedCategory, sortBy]);

  const loadTools = async () => {
    setLoading(true);
    try {
      const data = await toolsApi.getTools(1);
      
      let filteredTools = Array.isArray(data) ? data : data.tools || [];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredTools = filteredTools.filter((tool: Tool) => 
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
        );
      }
      
      if (selectedCategory !== 'all') {
        filteredTools = filteredTools.filter((tool: Tool) => {
          const toolName = tool.name.toLowerCase();
          const toolDesc = tool.description.toLowerCase();
          const category = selectedCategory.toLowerCase();
          
          const categoryKeywords: { [key: string]: string[] } = {
            'image processing': ['image', 'photo', 'picture', 'vision'],
            'natural language': ['text', 'language', 'nlp', 'word', 'sentiment'],
            'audio processing': ['audio', 'sound', 'music', 'voice'],
          };
          
          const keywords = categoryKeywords[category] || [category];
          return keywords.some(keyword => 
            toolName.includes(keyword) || toolDesc.includes(keyword)
          );
        });
      }
      
      filteredTools = sortTools(filteredTools, sortBy);
      setTools(filteredTools);
      
    } catch (error) {
      console.error('Failed to load tools:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const sortTools = (tools: Tool[], sortType: string) => {
    const sortedTools = [...tools];
    
    switch (sortType) {
      case 'newest':
        return sortedTools.reverse();
      case 'price-low':
        return sortedTools.sort((a, b) => a.usagePrice - b.usagePrice);
      case 'price-high':
        return sortedTools.sort((a, b) => b.usagePrice - a.usagePrice);
      case 'rating':
        return sortedTools.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'popular':
      default:
        return sortedTools;
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-20 px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="mb-8">
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  Explore <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AI Tools</span>
                </h1>
                <p className="text-xl text-cyan-400 mb-8 leading-relaxed">
                  Discover and integrate powerful decentralized AI agents to enhance your workflow
                </p>
                
                <div className="flex flex-col gap-4 mb-12">
                  <Link
                    href="createtool"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 text-center"
                  >
                    Become A Builder
                  </Link>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Categories
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`flex items-center gap-3 w-full text-left px-4 py-4 rounded-xl transition-all border group ${
                      selectedCategory === 'all' 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30 shadow-lg shadow-cyan-500/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      selectedCategory === 'all' ? 'bg-cyan-400' : 'bg-gray-500 group-hover:bg-cyan-400'
                    }`}></div>
                    <span className="font-medium">All Tools</span>
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all border group ${
                        selectedCategory === category 
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30 shadow-lg shadow-cyan-500/10' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        selectedCategory === category ? 'bg-cyan-400' : 'bg-gray-500 group-hover:bg-cyan-400'
                      }`}></div>
                      <span className="font-medium">{category}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{tools.length}+</div>
                      <div className="text-gray-400 text-sm">Tools Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">24/7</div>
                      <div className="text-gray-400 text-sm">Active Network</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search AI tools by name or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all pl-12 pr-20"
                />
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-400 transition-all font-medium"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory === 'all' ? 'All Tools' : selectedCategory}
                <span className="text-cyan-400 ml-2">({tools.length})</span>
              </h2>
              
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl bg-[#1a1b26] border border-white/20 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all appearance-none pr-8"
                >
                  <option value="popular" className="bg-[#1a1b26] text-white">Sort: Most Popular</option>
                  <option value="newest" className="bg-[#1a1b26] text-white">Sort: Newest</option>
                  <option value="price-low" className="bg-[#1a1b26] text-white">Sort: Price: Low to High</option>
                  <option value="price-high" className="bg-[#1a1b26] text-white">Sort: Price: High to Low</option>
                  <option value="rating" className="bg-[#1a1b26] text-white">Sort: Highest Rated</option>
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 animate-pulse">
                    <div className="h-6 bg-white/10 rounded mb-4"></div>
                    <div className="h-4 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 bg-white/10 rounded mb-4 w-3/4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-white/10 rounded-full w-20"></div>
                      <div className="h-6 bg-white/10 rounded-full w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {tools.map(tool => (
    <div key={tool.id} className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group flex flex-col h-full">
      {/* Tool Header with Rating */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 truncate">
            {tool.name}
          </h3>
          <StarRating rating={tool.rating || 0} />
        </div>
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold whitespace-nowrap ml-4">
          {tool.usagePrice === 0 ? 'Free' : `$${tool.usagePrice}`}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-6 leading  -relaxed flex-grow line-clamp-3">
        {tool.description}
      </p>

      {/* View Details Button */}
     <Link 
  href={`/tools/${tool.id}`}
  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all border border-cyan-400/20 hover:border-cyan-400/30 font-medium mt-auto block text-center"
>
  View Details 
</Link>
    </div>
  ))}
</div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-gray-400 text-lg mb-2">No tools found</div>
                <p className="text-gray-500">
                  {searchQuery ? `No results for "${searchQuery}"` : 'Try selecting a different category'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}