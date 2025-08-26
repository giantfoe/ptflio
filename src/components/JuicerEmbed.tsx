import React, { useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, AlertCircle, Instagram } from 'lucide-react';
import { manualInstagramService } from '../utils/manual-instagram-service';
import type { ManualInstagramPost } from '../utils/manual-instagram-service';

interface JuicerEmbedProps {
  feedId?: string;
  maxPosts?: number;
  showManualPosts?: boolean;
  className?: string;
  onPostClick?: (post: ManualInstagramPost) => void;
}

interface JuicerEmbedState {
  posts: ManualInstagramPost[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const JuicerEmbed: React.FC<JuicerEmbedProps> = ({
  feedId = 'ayorinde_john',
  maxPosts = 12,
  showManualPosts = true,
  className = '',
  onPostClick
}) => {
  const [state, setState] = useState<JuicerEmbedState>({
    posts: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const loadPosts = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const posts = await manualInstagramService.getCombinedPosts(true, feedId);
      const limitedPosts = posts.slice(0, maxPosts);
      
      setState({
        posts: limitedPosts,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load posts'
      }));
    }
  };

  useEffect(() => {
    loadPosts();
  }, [feedId, maxPosts]);

  const handleRefresh = () => {
    loadPosts();
  };

  const handlePostClick = (post: ManualInstagramPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      // Default behavior: open Instagram post in new tab
      window.open(post.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (state.loading) {
    return (
      <div className={`juicer-embed ${className}`}>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600">Loading Instagram posts...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`juicer-embed ${className}`}>
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <div className="text-center">
            <p className="text-red-700 font-medium">Failed to load posts</p>
            <p className="text-red-600 text-sm mt-1">{state.error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.posts.length === 0) {
    return (
      <div className={`juicer-embed ${className}`}>
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <Instagram className="w-6 h-6 text-gray-400 mr-2" />
          <div className="text-center">
            <p className="text-gray-600 font-medium">No Instagram posts found</p>
            <p className="text-gray-500 text-sm mt-1">
              Check your Juicer feed or add manual posts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`juicer-embed ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Instagram className="w-5 h-5 text-pink-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Instagram Feed
          </h3>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {state.posts.length} posts
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {state.lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {formatDate(state.lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh posts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {state.posts.map((post) => (
          <div
            key={post.id}
            className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            {/* Post Content Preview */}
            <div className="aspect-square bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative">
              {/* Instagram-style gradient background */}
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-80" />
              </div>
              
              {/* Post Type Indicator */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                  {post.mediaType === 'VIDEO' ? '📹' : '📷'}
                </span>
              </div>
              
              {/* Source Indicator */}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                  {post.id.startsWith('juicer_') ? 'Juicer' : 'Manual'}
                </span>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>
            
            {/* Post Info */}
            <div className="p-3">
              {post.title && (
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {post.title}
                </h4>
              )}
              
              {post.description && (
                <p className="text-gray-600 text-xs line-clamp-3 mb-2">
                  {post.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(post.addedAt)}</span>
                <span className="flex items-center">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Powered by{' '}
            <a
              href={`https://www.juicer.io/hub/${feedId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Juicer
            </a>
            {showManualPosts && ' & Manual Curation'}
          </span>
          
          <button
            onClick={() => window.open(`https://www.juicer.io/hub/${feedId}`, '_blank')}
            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Full Feed
          </button>
        </div>
      </div>
    </div>
  );
};

export default JuicerEmbed;