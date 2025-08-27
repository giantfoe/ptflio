"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { manualInstagramService, ManualInstagramPost } from "@/utils/manual-instagram-service";
import LazyMediaGrid from "@/components/ui/LazyMediaGrid";
import JuicerEmbed from "@/components/JuicerEmbed";
import { Settings, Plus, ExternalLink, Grid, List } from "lucide-react";
import Link from "next/link";

interface MediaItem {
  id: string;
  source: "youtube" | "instagram" | "github";
  title?: string;
  text?: string;
  url?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  isManual?: boolean;
}

interface EnhancedInstagramDisplayProps {
  apiPosts?: MediaItem[];
  onInstagramEmbed?: (postId: string, postUrl: string, title?: string) => void;
  showManagementLink?: boolean;
  className?: string;
  useJuicerFeed?: boolean;
  juicerFeedId?: string;
  displayMode?: 'grid' | 'juicer' | 'combined';
}

export default function EnhancedInstagramDisplay({
  apiPosts = [],
  onInstagramEmbed,
  showManagementLink = true,
  className = "",
  useJuicerFeed = true,
  juicerFeedId = 'ayorinde_john',
  displayMode = 'combined'
}: EnhancedInstagramDisplayProps) {
  const [manualPosts, setManualPosts] = useState<ManualInstagramPost[]>([]);
  const [combinedPosts, setCombinedPosts] = useState<ManualInstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<'grid' | 'juicer' | 'combined'>(displayMode);

  // Load posts based on current mode
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      if (useJuicerFeed && (currentDisplayMode === 'combined' || currentDisplayMode === 'juicer')) {
        // Load combined posts (manual + Juicer)
        const combined = await manualInstagramService.getCombinedPosts(true, juicerFeedId);
        setCombinedPosts(combined);
        
        // Also load manual posts separately for display info
        const manual = await manualInstagramService.getManualPosts();
        setManualPosts(manual.filter(post => post.isActive));
      } else {
        // Load only manual posts
        const posts = await manualInstagramService.getManualPosts();
        setManualPosts(posts.filter(post => post.isActive));
        setCombinedPosts([]);
      }
    } catch (error) {
      console.error('Failed to load Instagram posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [useJuicerFeed, currentDisplayMode, juicerFeedId]);

  // Load posts on mount and when dependencies change
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle display mode changes
  const handleDisplayModeChange = useCallback((mode: 'grid' | 'juicer' | 'combined') => {
    setCurrentDisplayMode(mode);
  }, []);

  // Convert posts to MediaItem format based on current mode
  const convertedPosts: MediaItem[] = useMemo(() => {
    const postsToConvert = currentDisplayMode === 'combined' && combinedPosts.length > 0 
      ? combinedPosts 
      : manualPosts;
    
    return postsToConvert.map(post => ({
      id: post.id.startsWith('juicer_') ? post.id : `manual-${post.id}`,
      source: "instagram" as const,
      title: post.title || (post.id.startsWith('juicer_') ? "Juicer Instagram Post" : "Manual Instagram Post"),
      text: post.description,
      url: post.url,
      imageUrl: undefined,
      thumbnailUrl: undefined,
      timestamp: post.addedAt,
      metadata: {
        isManual: !post.id.startsWith('juicer_'),
        isFromJuicer: post.id.startsWith('juicer_'),
        embedCode: post.embedCode,
        postId: post.postId,
        mediaType: post.mediaType
      },
      isManual: !post.id.startsWith('juicer_')
    }));
  }, [manualPosts, combinedPosts, currentDisplayMode])

  // Combine API posts and converted posts
  const allPosts = useMemo(() => {
    const combined = [...apiPosts, ...convertedPosts];
    // Sort by timestamp, newest first
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [apiPosts, convertedPosts]);

  // Get featured post IDs (first 2 posts)
  const featuredPostIds = useMemo(() => {
    return allPosts.slice(0, 2).map(post => post.id);
  }, [allPosts]);

  const handleInstagramEmbed = useCallback((postUrl: string, title?: string) => {
    if (onInstagramEmbed) {
      // Extract post ID from Instagram URL
      const postIdMatch = postUrl.match(/\/p\/([A-Za-z0-9_-]+)\/?/);
      if (postIdMatch) {
        onInstagramEmbed(postIdMatch[1], postUrl, title);
      }
    }
  }, [onInstagramEmbed]);

  // Handle Juicer post clicks
  const handleJuicerPostClick = useCallback((post: ManualInstagramPost) => {
    if (onInstagramEmbed) {
      // Extract post ID from Instagram URL
      const postIdMatch = post.url.match(/\/p\/([A-Za-z0-9_-]+)\/?/);
      if (postIdMatch) {
        onInstagramEmbed(postIdMatch[1], post.url, post.title);
      }
    }
  }, [onInstagramEmbed]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3 text-neutral-300">Loading Instagram content...</span>
      </div>
    );
  }

  if (allPosts.length === 0 && currentDisplayMode !== 'juicer') {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-white/5 rounded-lg border border-white/10 p-8">
          <h3 className="text-xl font-medium text-white mb-4">No Instagram Content</h3>
          <p className="text-neutral-400 mb-6">
            No Instagram posts are currently available. You can add posts manually, use the Juicer feed, or configure the Instagram API.
          </p>
          {showManagementLink && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleDisplayModeChange('juicer')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                <List className="w-4 h-4" />
                View Juicer Feed
              </button>
              <Link
                href="/admin/instagram"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Manual Posts
              </Link>
              <Link
                href="/admin/instagram"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configure Instagram
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with display mode controls and management link */}
      {showManagementLink && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Display Mode Toggle */}
            {useJuicerFeed && (
              <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => handleDisplayModeChange('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    currentDisplayMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Grid className="w-4 h-4 inline mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => handleDisplayModeChange('juicer')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    currentDisplayMode === 'juicer'
                      ? 'bg-purple-600 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1" />
                  Juicer
                </button>
                <button
                  onClick={() => handleDisplayModeChange('combined')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    currentDisplayMode === 'combined'
                      ? 'bg-green-600 text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Combined
                </button>
              </div>
            )}
            
            {/* Post counts */}
            <div className="text-sm text-neutral-400">
              {currentDisplayMode === 'combined' && combinedPosts.length > 0 ? (
                <span>
                  {combinedPosts.filter(p => !p.id.startsWith('juicer_')).length} manual, {' '}
                  {combinedPosts.filter(p => p.id.startsWith('juicer_')).length} Juicer, {' '}
                  {apiPosts.length} API posts
                </span>
              ) : (
                <span>
                  {apiPosts.length} API posts, {manualPosts.length} manual posts
                </span>
              )}
            </div>
          </div>
          
          <Link
            href="/admin/instagram"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-md transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Manage Instagram
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Content based on display mode */}
      {currentDisplayMode === 'juicer' ? (
        <JuicerEmbed
          feedId={juicerFeedId}
          maxPosts={12}
          showManualPosts={false}
          onPostClick={handleJuicerPostClick}
          className="bg-white/5 rounded-lg border border-white/10 p-6"
        />
      ) : (
        <>
          {/* Instagram Grid */}
          <LazyMediaGrid
            items={allPosts}
            onInstagramEmbed={handleInstagramEmbed}
            prominentInstagram={true}
            featuredPostIds={featuredPostIds}
            className="instagram-enhanced-grid"
          />

          {/* Posts indicator */}
          {(manualPosts.length > 0 || (currentDisplayMode === 'combined' && combinedPosts.length > 0)) && (
            <div className="mt-6 space-y-2">
              {currentDisplayMode === 'combined' && combinedPosts.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <List className="w-4 h-4" />
                    <span>
                      Combined view: {combinedPosts.filter(p => !p.id.startsWith('juicer_')).length} manual + {' '}
                      {combinedPosts.filter(p => p.id.startsWith('juicer_')).length} Juicer posts
                    </span>
                  </div>
                </div>
              )}
              
              {manualPosts.length > 0 && currentDisplayMode !== 'combined' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <Plus className="w-4 h-4" />
                    <span>
                      {manualPosts.length} manually curated post{manualPosts.length !== 1 ? 's' : ''} included
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}