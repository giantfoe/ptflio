'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink, RefreshCw, AlertTriangle, Monitor, Smartphone, Tablet } from 'lucide-react';

interface LivePreviewProps {
  url: string;
  title?: string;
  className?: string;
  height?: number;
  showControls?: boolean;
  allowFullscreen?: boolean;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes = {
  desktop: { width: '100%', height: '100%', icon: Monitor },
  tablet: { width: '768px', height: '1024px', icon: Tablet },
  mobile: { width: '375px', height: '667px', icon: Smartphone }
};

export const LivePreview: React.FC<LivePreviewProps> = ({
  url,
  title = 'Live Preview',
  className = '',
  height = 600,
  showControls = true,
  allowFullscreen = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsRefreshing(true);
      setIsLoading(true);
      setHasError(false);
      
      // Force reload by changing src
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
        setIsRefreshing(false);
      }, 100);
    }
  };
  
  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const currentViewport = viewportSizes[viewport];
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header with controls */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {url}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Viewport controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
              {Object.entries(viewportSizes).map(([size, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={size}
                    onClick={() => setViewport(size as ViewportSize)}
                    className={`
                      p-2 rounded transition-colors duration-200
                      ${
                        viewport === size
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }
                    `}
                    title={`${size} view`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            
            {/* Action buttons */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 disabled:opacity-50"
              title="Refresh preview"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={openInNewTab}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Preview container */}
      <div 
        className="relative bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
            <div className="flex flex-col items-center gap-3 text-center p-6">
              <AlertTriangle className="w-12 h-12 text-yellow-500" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Preview Unavailable
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Unable to load the preview. This might be due to CORS restrictions or the site being offline.
                </p>
                <button
                  onClick={openInNewTab}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Iframe container with responsive sizing */}
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{
            width: currentViewport.width,
            height: currentViewport.height,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          <iframe
            ref={iframeRef}
            src={url}
            title={title}
            className="w-full h-full border-0 rounded"
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            loading="lazy"
            allow={allowFullscreen ? 'fullscreen' : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default LivePreview;