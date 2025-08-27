'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface RSCNavigationWrapperProps {
  children: React.ReactNode;
}

interface NavigationError {
  message: string;
  timestamp: number;
  path: string;
  retryCount: number;
}

const RSCNavigationWrapper: React.FC<RSCNavigationWrapperProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationError, setNavigationError] = useState<NavigationError | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Handle RSC navigation errors
  const handleNavigationError = useCallback((error: Error) => {
    console.error('Navigation error detected:', error);
    
    // Check if it's an RSC-related error
    if (error.message.includes('_rsc') || 
        error.message.includes('ERR_ABORTED') ||
        error.message.includes('fetchServerResponse')) {
      
      setNavigationError({
        message: error.message,
        timestamp: Date.now(),
        path: pathname,
        retryCount: 0
      });
    }
  }, [pathname]);

  // Recovery mechanism for RSC errors
  const attemptRecovery = useCallback(async () => {
    if (!navigationError) return;
    
    setIsRecovering(true);
    
    try {
      // Strategy 1: Try soft refresh with router
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.refresh();
      
      // Strategy 2: If soft refresh fails, try hard navigation
      setTimeout(() => {
        if (navigationError.retryCount < 2) {
          setNavigationError(prev => prev ? {
            ...prev,
            retryCount: prev.retryCount + 1
          } : null);
          
          // Force hard navigation
          window.location.href = pathname;
        } else {
          // Last resort: full page reload
          window.location.reload();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Recovery attempt failed:', error);
    } finally {
      setIsRecovering(false);
    }
  }, [navigationError, router, pathname]);

  // Clear error when navigation succeeds
  useEffect(() => {
    if (navigationError && pathname !== navigationError.path) {
      setNavigationError(null);
    }
  }, [pathname, navigationError]);

  // Listen for unhandled promise rejections (common with RSC errors)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('_rsc') || 
          event.reason?.message?.includes('ERR_ABORTED')) {
        event.preventDefault();
        handleNavigationError(new Error(event.reason.message || 'RSC Navigation Error'));
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleNavigationError]);

  // Auto-recovery for RSC errors
  useEffect(() => {
    if (navigationError && !isRecovering) {
      const timer = setTimeout(() => {
        attemptRecovery();
      }, 3000); // Wait 3 seconds before attempting recovery
      
      return () => clearTimeout(timer);
    }
  }, [navigationError, isRecovering, attemptRecovery]);

  // Render error state for RSC navigation issues
  if (navigationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Navigation Issue
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;re experiencing a temporary navigation issue. 
              {isRecovering ? ' Attempting to recover...' : ' Recovery will start automatically.'}
            </p>

            {isRecovering && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-blue-500 font-medium">Recovering...</span>
              </div>
            )}

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">What&apos;s happening?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is a React Server Components navigation error. We&apos;re automatically 
                attempting to recover and restore normal functionality.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={attemptRecovery}
                disabled={isRecovering}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRecovering ? 'animate-spin' : ''}`} />
                {isRecovering ? 'Recovering...' : 'Try Again'}
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technical Details
                </summary>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-xs font-mono text-gray-800 dark:text-gray-200">
                  <div><strong>Error:</strong> {navigationError.message}</div>
                  <div><strong>Path:</strong> {navigationError.path}</div>
                  <div><strong>Retry Count:</strong> {navigationError.retryCount}</div>
                  <div><strong>Timestamp:</strong> {new Date(navigationError.timestamp).toISOString()}</div>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleNavigationError}>
      {children}
    </ErrorBoundary>
  );
};

export default RSCNavigationWrapper;