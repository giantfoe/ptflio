'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log RSC-specific errors
    if (error.message.includes('_rsc') || error.message.includes('ERR_ABORTED')) {
      console.error('RSC Navigation Error detected:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRSCError = this.state.error?.message.includes('_rsc') || 
                        this.state.error?.message.includes('ERR_ABORTED');
      
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isRSCError ? 'Navigation Error' : 'Something went wrong'}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isRSCError 
                  ? 'There was an issue with page navigation. This might be a temporary problem.'
                  : 'An unexpected error occurred while loading this page.'
                }
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry ({this.maxRetries - this.state.retryCount} left)
                  </button>
                )}
                
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </div>

              {!canRetry && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Maximum retry attempts reached. Please refresh the page or go home.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);
    
    // Handle RSC-specific errors
    if (error.message.includes('_rsc') || error.message.includes('ERR_ABORTED')) {
      console.error('RSC Error detected, attempting recovery...');
      
      // Force a hard refresh for RSC errors
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}