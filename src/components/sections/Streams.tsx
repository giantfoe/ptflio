"use client";
import { useState, useCallback, useMemo } from "react";
import useSWR from "swr";
import LazyMediaGrid from "@/components/ui/LazyMediaGrid";
import Modal from "@/components/ui/Modal";
import InstagramEmbedModal from "@/components/ui/InstagramEmbedModal";
import EnhancedInstagramDisplay from "@/components/instagram/EnhancedInstagramDisplay";
import { createComponentLogger } from "@/utils/logger";
import { RefreshCw, AlertCircle, CheckCircle, Clock, Wifi, WifiOff, Database } from "lucide-react";

// Enhanced API Response interface
export interface ApiResponse {
  data: Array<{
    id: string;
    source: "youtube" | "instagram" | "github";
    title: string;
    text: string;
    url: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;
  metadata: {
    cached: boolean;
    source?: string;
    requestDuration: number;
    totalResults?: number;
    nextPageToken?: string;
    prevPageToken?: string;
  };
}

// Health check response interface
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: Array<{
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
    details?: Record<string, unknown>;
  }>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

// Service status interface
export interface ServiceStatus {
  youtube: { 
    available: boolean; 
    error?: string; 
    lastChecked?: Date;
    responseTime?: number;
    status?: 'healthy' | 'degraded' | 'unhealthy';
  };
  instagram: { 
    available: boolean; 
    error?: string; 
    lastChecked?: Date;
    responseTime?: number;
    status?: 'healthy' | 'degraded' | 'unhealthy';
  };
}

// SWR fetcher function
const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: 'Network Error', 
      message: `HTTP ${response.status}: ${response.statusText}` 
    }));
    
    const error = new Error(errorData.message || `Failed to fetch data: ${response.status}`) as Error & { status?: number; info?: unknown };
    error.status = response.status;
    error.info = errorData;
    throw error;
  }
  
  return response.json();
};

// Health check fetcher
const healthFetcher = async (url: string): Promise<HealthResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
};

export default function Streams() {
  const logger = createComponentLogger('Streams');
  const [activeTab, setActiveTab] = useState("youtube");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [instagramEmbed, setInstagramEmbed] = useState<{
    isOpen: boolean;
    postId: string;
    postUrl: string;
    title?: string;
    thumbnailUrl?: string;
    imageUrl?: string;
  }>({ isOpen: false, postId: "", postUrl: "" });
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    youtube: { available: true },
    instagram: { available: true }
  });
  
  // SWR configuration
  const swrConfig = {
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStatus = (error as { status?: number }).status;
      logger.error('SWR fetch error', {
        service: activeTab,
        error: errorMessage,
        status: errorStatus
      });
    },
    onSuccess: (data: ApiResponse) => {
      logger.info('SWR fetch success', {
        service: activeTab,
        itemCount: data.data?.length || 0,
        cached: data.metadata?.cached,
        requestDuration: data.metadata?.requestDuration
      });
    }
  };
  
  // Fetch data using SWR
  const { 
    data, 
    error, 
    isLoading, 
    mutate: refetch,
    isValidating 
  } = useSWR<ApiResponse>(
    `/api/${activeTab}`,
    fetcher,
    swrConfig
  );
  
  // Fetch health status
  const { 
    data: healthData,
    mutate: refetchHealth 
  } = useSWR<HealthResponse>(
    '/api/health',
    healthFetcher,
    {
      refreshInterval: 60000, // 1 minute
      revalidateOnFocus: false,
      errorRetryCount: 2
    }
  );
  
  // Calculate available services based on health data
  const availableServices = useMemo(() => {
    if (!healthData) return ['youtube', 'instagram'];
    
    return healthData.services
      .filter(service => service.status === 'healthy' || service.status === 'degraded')
      .map(service => service.service)
      .filter(service => ['youtube', 'instagram'].includes(service));
  }, [healthData]);
  
  // Update service status based on health data
  useMemo(() => {
    if (healthData) {
      const newStatus: ServiceStatus = {
        youtube: { available: true },
        instagram: { available: true }
      };
      
      healthData.services.forEach(service => {
        if (service.service === 'youtube' || service.service === 'instagram') {
          newStatus[service.service] = {
            available: service.status !== 'unhealthy',
            error: service.error,
            lastChecked: new Date(healthData.timestamp),
            responseTime: service.responseTime,
            status: service.status
          };
        }
      });
      
      setServiceStatus(newStatus);
    }
  }, [healthData]);

  // Modal state management
  const handleItemClick = (videoId: string) => {
    setSelectedVideoId(videoId);
    setIsModalOpen(true);
  };
  
  const handleVideoClick = useCallback((videoUrl: string) => {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (videoId) {
      setSelectedVideoId(videoId);
      setIsModalOpen(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedVideoId(null);
  }, []);

  const handleInstagramEmbed = useCallback((postUrl: string, title?: string) => {
    // Extract post ID from Instagram URL
    const postIdMatch = postUrl.match(/\/p\/([A-Za-z0-9_-]+)\/?/);
    if (postIdMatch) {
      // Find the current item to get thumbnail and image URLs
      const currentItem = data?.data?.find(item => item.url === postUrl);
      
      setInstagramEmbed({
        isOpen: true,
        postId: postIdMatch[1],
        postUrl,
        title,
        thumbnailUrl: currentItem?.thumbnailUrl,
        imageUrl: currentItem?.imageUrl
      });
    }
  }, [data?.data]);

  const closeInstagramEmbed = useCallback(() => {
    setInstagramEmbed({ isOpen: false, postId: "", postUrl: "", thumbnailUrl: undefined, imageUrl: undefined });
  }, []);
  
  const handleRefresh = useCallback(() => {
    logger.info('Manual refresh triggered', { activeTab });
    refetch();
    refetchHealth();
  }, [activeTab, refetch, refetchHealth, logger]);
  
  const handleTabChange = useCallback((newTab: string) => {
    if (availableServices.includes(newTab)) {
      logger.info('Tab changed', { from: activeTab, to: newTab });
      setActiveTab(newTab);
    }
  }, [activeTab, availableServices, logger]);
  
  // Format error message for display
  const getErrorMessage = useCallback((error: unknown) => {
    if (!error) return null;
    
    const status = (error as { status?: number }).status;
    const info = (error as { info?: { message?: string } }).info;
    
    switch (status) {
      case 503:
        return `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} service is not configured. Please check your environment variables.`;
      case 429:
        return `Rate limit exceeded for ${activeTab}. Please try again later.`;
      case 403:
        return `Access forbidden for ${activeTab}. Please check your API credentials.`;
      case 400:
        return `Invalid request to ${activeTab} service. Please check your configuration.`;
      case 502:
        return `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} service is temporarily unavailable.`;
      default:
        return info?.message || (error as { message?: string }).message || `Unable to load ${activeTab} content`;
    }
  }, [activeTab]);
  
  // Get status icon based on service health
  const getStatusIcon = (service: keyof ServiceStatus) => {
    const status = serviceStatus[service];
    
    if (!status.available) {
      return <WifiOff className="w-3 h-3 text-red-400" />;
    }
    
    switch (status.status) {
      case 'healthy':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
      case 'unhealthy':
        return <WifiOff className="w-3 h-3 text-red-400" />;
      default:
        return <Wifi className="w-3 h-3 text-blue-400" />;
    }
  };

  // Log component state for debugging
  logger.debug('Component render state', {
    isLoading,
    isValidating,
    hasError: !!error,
    hasData: !!data,
    itemsLength: data?.data?.length || 0,
    activeTab,
    availableServices,
    cached: data?.metadata?.cached
  });



  return (
    <section id="streams" className="min-h-[100svh] py-24 bg-[color-mix(in_oklab,black,white_5%)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-2 text-white">Streams</h2>
            <p className="text-neutral-300">Discover my latest videos and posts from YouTube and Instagram.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Health status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {healthData ? (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  healthData.status === 'healthy' ? 'bg-green-500/10 text-green-400' :
                  healthData.status === 'degraded' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {healthData.status === 'healthy' ? <CheckCircle className="w-3 h-3" /> :
                   healthData.status === 'degraded' ? <AlertCircle className="w-3 h-3" /> :
                   <WifiOff className="w-3 h-3" />}
                  <span className="capitalize">{healthData.status}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-500/10 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Checking...</span>
                </div>
              )}
            </div>
            
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading || isValidating}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${(isLoading || isValidating) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Cache status indicator */}
        {data?.metadata?.cached && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                Showing cached data (loaded in {data.metadata.requestDuration}ms from {data.metadata.source})
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleTabChange("youtube")}
            disabled={!serviceStatus.youtube.available}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "youtube" 
                ? "bg-white/10" 
                : serviceStatus.youtube.available
                  ? "bg-transparent hover:bg-white/5"
                  : "bg-transparent opacity-50 cursor-not-allowed"
            }`}
            title={!serviceStatus.youtube.available ? serviceStatus.youtube.error : 
                   serviceStatus.youtube.responseTime ? `Response time: ${serviceStatus.youtube.responseTime}ms` : undefined}
          >
            <span>YouTube</span>
            {getStatusIcon('youtube')}
            {serviceStatus.youtube.responseTime && serviceStatus.youtube.available && (
              <span className="text-xs text-neutral-400">({serviceStatus.youtube.responseTime}ms)</span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("instagram")}
            disabled={!serviceStatus.instagram.available}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === "instagram" 
                ? "bg-white/10" 
                : serviceStatus.instagram.available
                  ? "bg-transparent hover:bg-white/5"
                  : "bg-transparent opacity-50 cursor-not-allowed"
            }`}
            title={!serviceStatus.instagram.available ? serviceStatus.instagram.error : 
                   serviceStatus.instagram.responseTime ? `Response time: ${serviceStatus.instagram.responseTime}ms` : undefined}
          >
            <span>Instagram</span>
            {getStatusIcon('instagram')}
            {serviceStatus.instagram.responseTime && serviceStatus.instagram.available && (
              <span className="text-xs text-neutral-400">({serviceStatus.instagram.responseTime}ms)</span>
            )}
          </button>
        </div>
        
        {/* Service status indicator */}
        {availableServices.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-400 font-medium mb-2">Services Unavailable</h3>
            <p className="text-neutral-300 text-sm mb-3">
              No streaming services are currently configured. Please check your configuration:
            </p>
            <ul className="text-neutral-400 text-sm space-y-1">
              {!serviceStatus.youtube.available && (
                <li>• YouTube: Configure YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID</li>
              )}
              {!serviceStatus.instagram.available && (
                <li>• Instagram: Check Juicer feed configuration</li>
              )}
            </ul>
          </div>
        )}
        
        {availableServices.length > 0 && availableServices.length < 2 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
            <p className="text-blue-400 text-sm">
              Some services are unavailable. Configure additional APIs for more content.
            </p>
          </div>
        )}
        {(isLoading || isValidating) && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              {isValidating && !isLoading && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="mt-3 text-center">
              <span className="text-neutral-300">
                {isLoading ? `Loading ${activeTab} content...` : 'Refreshing data...'}
              </span>
              {data?.metadata?.source && (
                <p className="text-xs text-neutral-500 mt-1">
                  {isValidating ? 'Checking for updates' : `Last loaded from ${data.metadata.source}`}
                </p>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-400 font-medium mb-1">Failed to load content</h3>
                  <p className="text-red-300 text-sm">
                    {getErrorMessage(error)}
                  </p>
                  {error.message?.includes('configuration') && (
                    <p className="text-red-300/80 text-xs mt-2">
                      {activeTab === 'instagram' ? 'Check your Juicer feed configuration.' : 'Check your environment variables and API keys.'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                title="Retry loading"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}
        
        {!isLoading && !error && data?.data?.length === 0 && availableServices.includes(activeTab) && (
          <div className="text-center py-12">
            <p className="text-neutral-400 mb-2">No {activeTab} content available</p>
            <p className="text-neutral-500 text-sm">Check back later for new content.</p>
          </div>
        )}
        
        {!isLoading && !error && data?.data && data.data.length > 0 && (
          <>
            {activeTab === 'instagram' ? (
              <EnhancedInstagramDisplay
                apiPosts={data.data}
                onInstagramEmbed={handleInstagramEmbed}
                showManagementLink={true}
              />
            ) : (
              <LazyMediaGrid 
                items={data.data} 
                onVideoClick={handleVideoClick}
                onInstagramEmbed={handleInstagramEmbed}
                prominentInstagram={false}
                featuredPostIds={[]}
              />
            )}
            <div className="mt-8 space-y-3">
              {/* Data summary */}
              <div className="text-center">
                <p className="text-neutral-400 text-sm">
                  Showing {data.data.length} {activeTab} {data.data.length === 1 ? 'item' : 'items'}
                  {data.metadata?.totalResults && data.metadata.totalResults > data.data.length && (
                    <span className="text-neutral-500"> of {data.metadata.totalResults} total</span>
                  )}
                </p>
              </div>
              
              {/* Performance and cache info */}
              {data.metadata && (
                <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Loaded in {data.metadata.requestDuration}ms
                  </span>
                  <span className="flex items-center gap-1">
                    {data.metadata.cached ? (
                      <><Database className="w-3 h-3" /> From cache</>
                    ) : (
                      <><Wifi className="w-3 h-3" /> From API</>
                    )}
                  </span>
                  {healthData?.timestamp && (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      Updated {new Date(healthData.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          {selectedVideoId && (
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${selectedVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </Modal>
        
        <InstagramEmbedModal
          isOpen={instagramEmbed.isOpen}
          onClose={closeInstagramEmbed}
          postId={instagramEmbed.postId}
          postUrl={instagramEmbed.postUrl}
          title={instagramEmbed.title}
          thumbnailUrl={instagramEmbed.thumbnailUrl}
          imageUrl={instagramEmbed.imageUrl}
        />
      </div>
    </section>
  );
}