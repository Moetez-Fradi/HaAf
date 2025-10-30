'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ownerWallet: string;
  requiredEnv: string[];
  priceMode?: string;
  fixedPrice?: number;
  energyBaseline?: number;
}

interface Review {
  id: string;
  stars: number;
  comment: string | null;
  userId: string;
  user: {
    id: string;
    displayName: string;
  };
}

interface ReviewStats {
  toolId: string;
  totalReviews: number;
  averageRating: number;
}

const API_BASE = 'http://localhost:3001';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('access_token');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.state?.token ?? null; 
    } catch (err) {
      console.error('Failed to parse token from localStorage', err);
      return null;
    }
  }
  return null;
};

const StarRating = ({ rating = 0, size = 'md' }: { rating?: number; size?: 'sm' | 'md' | 'lg' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const starSize = size === 'lg' ? 24 : size === 'md' ? 20 : 16;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return (
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          );
        } else if (i === fullStars && hasHalfStar) {
          return (
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" className="text-yellow-400">
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
            <svg key={i} width={starSize} height={starSize} viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          );
        }
      })}
      <span className="text-gray-400 text-sm ml-1">({rating.toFixed(1)})</span>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    DEPLOYED: { color: 'bg-green-500/20 text-green-400 border-green-400/30', label: 'Deployed' },
    TESTING: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30', label: 'Testing' },
    PENDING: { color: 'bg-blue-500/20 text-blue-400 border-blue-400/30', label: 'Pending' },
    FAILED: { color: 'bg-red-500/20 text-red-400 border-red-400/30', label: 'Failed' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || 
                 { color: 'bg-gray-500/20 text-gray-400 border-gray-400/30', label: status };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function ToolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.id as string;

  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [newReviewStars, setNewReviewStars] = useState<number>(0);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
useEffect(() => {
  if (!toolId) {
    router.push('/tools');
    return;
  }
  const token = getAuthToken();
  if (!token) {
    router.push('/login');
    return;
  }
  loadToolDetails();
}, [toolId]);


  const loadToolDetails = async () => {
  setLoading(true);
  try {
    const token = getAuthToken();

    if (!token) {
      console.warn('[loadToolDetails] No token found, redirecting to login');
      router.push('/login'); // or wherever your auth page is
      return;
    }

    // Load tool details
    const toolResponse = await fetch(`${API_BASE}/tools/${toolId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!toolResponse.ok) {
      throw new Error(`Failed to fetch tool details: ${toolResponse.status}`);
    }

    const toolData = await toolResponse.json();
    setTool(toolData);

    // Load reviews
    const reviewsResponse = await fetch(`${API_BASE}/reviews/tool/${toolId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);
    }

    // Load stats
    const statsResponse = await fetch(`${API_BASE}/reviews/tool/${toolId}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      setReviewStats(statsData);
    }
  } catch (error) {
    console.error('[loadToolDetails] Error:', error);
    setTool(null);
  } finally {
    setLoading(false);
  }
};

    const submitReview = async () => {
    if (!newReviewStars) {
      alert('Please select a rating');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = getAuthToken();
      const reviewData = {
        toolId: toolId,
        stars: newReviewStars,
        comment: newReviewComment || null,
      };

      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      // Reset form
      setNewReviewStars(0);
      setNewReviewComment('');
      
      // Reload reviews and stats
      await loadToolDetails();
      
      console.log('Review submitted successfully');
      
    } catch (error) {
      console.error('Error submitting review:', error);
      // Type-safe error handling
      if (error instanceof Error) {
        alert(error.message || 'Failed to submit review');
      } else {
        alert('Failed to submit review');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="text-white text-xl">Loading tool details...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="text-white text-xl">Tool not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 px-8 py-8 max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tool Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold text-white">{tool.name}</h1>
                    <StatusBadge status={tool.status} />
                  </div>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <StarRating rating={tool.rating} size="lg" />
                  
                    {reviewStats && (
                      <span className="text-gray-400">
                        {reviewStats.totalReviews} reviews
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      href={`/tools/${tool.id}/test`}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 inline-block text-center"
                    >
                      Test Tool
                    </Link>
                    <Link 
                      href="/tools/createtool"
                      className="px-8 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20 inline-block text-center"
                    >
                      Create a Tool
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex space-x-1 mb-6">
                {['overview', 'specifications', 'deployment'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content - Overview is automatically shown by default */}
              <div className="text-gray-300">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-3">Tool Description</h3>
                      <p className="leading-relaxed">{tool.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-cyan-400 font-semibold mb-2">Input Shape</h4>
                        <p className="text-sm">{tool.inputShape}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-cyan-400 font-semibold mb-2">Output Shape</h4>
                        <p className="text-sm">{tool.outputShape}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-cyan-400 font-semibold mb-3">Technical Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <StatusBadge status={tool.status} />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price Mode:</span>
                            <span className="text-white">{tool.priceMode || 'Fixed'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-cyan-400 font-semibold mb-3">Environment Variables</h4>
                        {tool.requiredEnv && tool.requiredEnv.length > 0 ? (
                          <ul className="space-y-2">
                            {tool.requiredEnv.map((env, index) => (
                              <li key={index} className="text-sm text-gray-300">
                                {env}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm">No environment variables required</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'deployment' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-6">
                      <h4 className="text-cyan-400 font-semibold mb-4">Deployment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Energy Baseline:</span>
                          <div className="text-white mt-1">
                            {tool.energyBaseline ? `${tool.energyBaseline} units` : 'Not set'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section - Below tabs */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white  font-bold text-2xl mb-6">Reviews & Ratings</h3>
              
              {/* Review Stats */}
              {reviewStats && (
                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-1">{reviewStats.averageRating.toFixed(1)}</div>
                      <StarRating rating={reviewStats.averageRating} size="md" />
                      <div className="text-gray-400 text-sm mt-2">{reviewStats.totalReviews} reviews</div>
                    </div>
                    <div className="flex-1">
                      {/* You can add rating distribution here if needed */}
                    </div>
                  </div>
                </div>
              )}

              {/* Add Review Form */}
              <div className="bg-white/5 rounded-xl p-6 mb-6">
                <h4 className="text-white font-bold text-lg mb-4">Write a Review</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 mb-2 block">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReviewStars(star)}
                          className={`text-2xl transition-colors ${
                            star <= newReviewStars ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-300 mb-2 block">Your Comment (Optional)</label>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Share your experience with this tool..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={submitReview}
                    disabled={isSubmittingReview || !newReviewStars}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg mb-4">User Reviews</h4>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                            <span className="text-cyan-400 text-sm font-semibold">
                              {review.user.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white font-medium">{review.user.displayName}</span>
                        </div>
                        <StarRating rating={review.stars} size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No reviews yet. Be the first to review this tool!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Tool Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <StatusBadge status={tool.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Price</span>
                    <span className="text-cyan-400 font-semibold">
                      {tool.usagePrice === 0 ? 'Free' : `$${tool.usagePrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rating</span>
                    <StarRating rating={tool.rating} size="sm" />
                  </div>
                  {reviewStats && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Reviews</span>
                      <span className="text-white">{reviewStats.totalReviews}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Integration Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Test Tool in a Workflow</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Ready to use this tool in your project? Click below to use this tool in a workflow.
                </p>
                <Link 
                  href="/workflows"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all inline-block text-center"
                >
                  Workflow Integration
                </Link>
              </div>

              {/* Support */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Having issues with integration or have questions about this tool?
                </p>
                <button className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}