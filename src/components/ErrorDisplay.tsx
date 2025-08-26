'use client';

import React from 'react';
import { AlertCircle, Link, RefreshCw, Home, Info, AlertTriangle, Zap, Bug } from 'lucide-react';
import { parseError } from '@/utils/error-parser';

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  className?: string;
}





/**
 * Enhanced error display component with structured data presentation
 */
export function ErrorDisplay({ 
  error, 
  onRetry, 
  onGoHome, 
  showDetails = true, 
  className = '' 
}: ErrorDisplayProps) {
  const parsedError = parseError(error);
  
  const getErrorIcon = () => {
    switch (parsedError.type) {
      case 'RSC_NAVIGATION':
        return <RefreshCw className="w-16 h-16 text-blue-500 mx-auto mb-4" />;
      case 'NETWORK_ABORT':
        return <Link className="w-16 h-16 text-orange-500 mx-auto mb-4" />;
      case 'API_ERROR':
        return <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />;
      case 'VALIDATION_ERROR':
        return <Bug className="w-16 h-16 text-purple-500 mx-auto mb-4" />;
      default:
        return <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
    }
  };
  
  const getErrorTitle = () => {
    switch (parsedError.type) {
      case 'RSC_NAVIGATION':
        return 'Navigation Error';
      case 'NETWORK_ABORT':
        return 'Network Error';
      case 'API_ERROR':
        return 'API Error';
      case 'VALIDATION_ERROR':
        return 'Validation Error';
      default:
        return 'Error Occurred';
    }
  };
  
  const getErrorDescription = () => {
    return parsedError.message;
  };
  
  const getSeverityColor = () => {
    switch (parsedError.severity) {
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center ${className}`}>
      {getErrorIcon()}
      
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getErrorTitle()}
        </h2>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor()} bg-opacity-10`}>
          {parsedError.severity.toUpperCase()}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {getErrorDescription()}
      </p>
      
      {parsedError.recoverable && parsedError.suggestions && parsedError.suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 max-w-2xl w-full">
          <div className="flex items-center mb-3">
            <Zap className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suggestions
            </h3>
          </div>
          <ul className="text-left space-y-2">
            {parsedError.suggestions.map((suggestion, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showDetails && parsedError.details && Object.keys(parsedError.details).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 max-w-2xl w-full">
          <div className="flex items-center mb-3">
            <Info className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Technical Details
            </h3>
          </div>
          
          <div className="space-y-3 text-left">
            {Object.entries(parsedError.details).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-sm break-all">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
        
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && parsedError.recoverable && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        )}
      </div>
      
      {/* Additional Help */}
      {!parsedError.recoverable && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            <strong>Critical Error:</strong> This error cannot be automatically recovered. Please contact support if the issue persists.
          </p>
        </div>
      )}
      
      {parsedError.recoverable && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Need help?</strong> If this error persists, try refreshing the page or clearing your browser cache.
            {parsedError.type === 'RSC_NAVIGATION' && (
              <> This type of error is usually related to React Server Components and resolves automatically.</>  
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default ErrorDisplay;