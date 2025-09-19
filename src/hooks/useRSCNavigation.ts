'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationState {
  isNavigating: boolean;
  error: string | null;
  retryCount: number;
  lastClickedProject?: string;
}

interface UseRSCNavigationReturn {
  navigate: (href: string, projectName?: string) => Promise<void>;
  navigateToHome: (scrollToProject?: string) => Promise<void>;
  refresh: () => Promise<void>;
  state: NavigationState;
  clearError: () => void;
}

/**
 * Custom hook to handle RSC navigation with error recovery
 * Provides fallback mechanisms for ERR_ABORTED and _rsc parameter issues
 */
export function useRSCNavigation(): UseRSCNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    error: null,
    retryCount: 0
  });

  // Clear error when pathname changes (successful navigation)
  useEffect(() => {
    if (state.error) {
      setState(prev => ({ ...prev, error: null, retryCount: 0 }));
    }
  }, [pathname, state.error]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  const navigate = useCallback(async (href: string, projectName?: string) => {
    setState(prev => ({ 
      ...prev, 
      isNavigating: true, 
      error: null,
      lastClickedProject: projectName || prev.lastClickedProject
    }));

    try {
      // Strategy 1: Try Next.js router navigation
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Navigation timeout'));
        }, 5000);

        try {
          router.push(href);
          // Give some time for the navigation to complete
          setTimeout(() => {
            clearTimeout(timeout);
            resolve();
          }, 1000);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

    } catch (error) {
      console.warn('Next.js navigation failed, trying fallback:', error);
      
      setState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        error: error instanceof Error ? error.message : 'Navigation failed'
      }));

      // Strategy 2: Fallback to window.location for RSC errors
      if (state.retryCount < 2) {
        try {
          // Use window.location as fallback
          window.location.href = href;
        } catch (fallbackError) {
          console.error('Fallback navigation also failed:', fallbackError);
          setState(prev => ({ 
            ...prev, 
            error: 'All navigation methods failed'
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          error: 'Maximum retry attempts reached'
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [router, state.retryCount]);

  const navigateToHome = useCallback(async (scrollToProject?: string) => {
    setState(prev => ({ ...prev, isNavigating: true, error: null }));

    try {
      // Navigate to home page
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Navigation timeout'));
        }, 5000);

        try {
          router.push('/');
          // Give time for navigation to complete
          setTimeout(() => {
            clearTimeout(timeout);
            resolve();
          }, 1000);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });

      // After navigation, scroll to the specific project if provided
      if (scrollToProject) {
        // Wait for page to load with optimized timing
        setTimeout(() => {
          const projectElement = document.getElementById(`project-${scrollToProject}`);
          if (projectElement) {
            projectElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }
        }, 400);
      }

    } catch (error) {
      console.warn('Home navigation failed, trying fallback:', error);
      
      setState(prev => ({ 
        ...prev, 
        retryCount: prev.retryCount + 1,
        error: error instanceof Error ? error.message : 'Navigation failed'
      }));

      // Fallback to window.location
      if (state.retryCount < 2) {
        try {
          const homeUrl = scrollToProject ? `/#project-${scrollToProject}` : '/';
          window.location.href = homeUrl;
        } catch (fallbackError) {
          console.error('Fallback home navigation failed:', fallbackError);
          setState(prev => ({ 
            ...prev, 
            error: 'All navigation methods failed'
          }));
        }
      }
    } finally {
      setState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [router, state.retryCount]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      // Try router refresh first
      router.refresh();
      
      // Wait a bit for the refresh to take effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({ ...prev, isRefreshing: false }));
    } catch (error) {
      console.error('Router refresh failed:', error);
      
      // Fallback to full page reload
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  }, [router]);

  return {
    navigate,
    navigateToHome,
    refresh,
    state,
    clearError
  };
}

/**
 * Higher-order component to wrap links with RSC-safe navigation
 */
export function withRSCNavigation<T extends { href: string; onClick?: () => void; style?: React.CSSProperties }>(
  Component: React.ComponentType<T>
) {
  return function RSCNavigationComponent(props: T) {
    const { navigate, state } = useRSCNavigation();
    const { href, onClick } = props;

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      
      // Call original onClick if provided
      if (onClick) {
        onClick();
      }
      
      // Use RSC-safe navigation
      navigate(href);
    }, [navigate, href, onClick]);

    const enhancedProps = {
      ...props,
      onClick: handleClick,
      style: {
        ...props.style,
        opacity: state.isNavigating ? 0.7 : 1,
        pointerEvents: state.isNavigating ? 'none' as const : 'auto' as const
      }
    };

    return React.createElement(Component, enhancedProps);
  };
}

/**
 * Utility function to check if an error is RSC-related
 */
export function isRSCError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    message.includes('_rsc') ||
    message.includes('ERR_ABORTED') ||
    message.includes('fetchServerResponse') ||
    message.includes('RSC') ||
    message.includes('Server Component')
  );
}

/**
 * Utility function to extract RSC error details
 */
export function parseRSCError(error: Error | string): {
  isRSC: boolean;
  originalUrl?: string;
  timestamp?: string;
  rscParam?: string;
} {
  const message = typeof error === 'string' ? error : error.message;
  
  if (!isRSCError(error)) {
    return { isRSC: false };
  }

  // Extract URL from error message
  const urlMatch = message.match(/https?:\/\/[^\s]+/);
  const originalUrl = urlMatch ? urlMatch[0] : undefined;
  
  // Extract timestamp
  const timestampMatch = message.match(/ide_webview_request_time=(\d+)/);
  const timestamp = timestampMatch ? timestampMatch[1] : undefined;
  
  // Extract RSC parameter
  const rscMatch = message.match(/_rsc=([^&\s]+)/);
  const rscParam = rscMatch ? rscMatch[1] : undefined;

  return {
    isRSC: true,
    originalUrl,
    timestamp,
    rscParam
  };
}