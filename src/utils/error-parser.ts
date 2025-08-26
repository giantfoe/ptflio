/**
 * Comprehensive error parsing utilities for handling various error types
 * including ERR_ABORTED, RSC navigation errors, and network failures
 */

export interface ParsedError {
  type: 'RSC_NAVIGATION' | 'NETWORK_ABORT' | 'API_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  originalMessage: string;
  details: {
    url?: string;
    timestamp?: Date;
    rscId?: string;
    requestTime?: number;
    statusCode?: number;
    method?: string;
    userAgent?: string;
    domain?: string;
    path?: string;
    queryParams?: Record<string, string>;
    headers?: Record<string, string>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  suggestions: string[];
}

/**
 * Parse URL and extract components
 */
function parseUrl(url: string): {
  domain?: string;
  path?: string;
  queryParams?: Record<string, string>;
} {
  try {
    const urlObj = new URL(url);
    const queryParams: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    return {
      domain: urlObj.hostname,
      path: urlObj.pathname,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined
    };
  } catch (parseError: unknown) {
    return {};
  }
}

/**
 * Parse ERR_ABORTED errors with detailed information extraction
 */
function parseAbortedError(message: string): Partial<ParsedError> {
  const urlMatch = message.match(/https?:\/\/[^\s]+/);
  const url = urlMatch?.[0];
  
  if (!url) {
    return {
      type: 'NETWORK_ABORT',
      message: 'Network request was aborted',
      severity: 'medium',
      recoverable: true,
      suggestions: ['Retry the request', 'Check network connection']
    };
  }
  
  const urlDetails = parseUrl(url);
  const timestampMatch = message.match(/ide_webview_request_time=(\d+)/);
  const rscMatch = message.match(/_rsc=([^&\s]+)/);
  
  const timestamp = timestampMatch ? new Date(parseInt(timestampMatch[1])) : undefined;
  const requestTime = timestampMatch ? parseInt(timestampMatch[1]) : undefined;
  
  return {
    type: rscMatch ? 'RSC_NAVIGATION' : 'NETWORK_ABORT',
    message: rscMatch 
      ? 'React Server Component navigation was aborted'
      : 'Network request was aborted',
    details: {
      url,
      timestamp,
      rscId: rscMatch?.[1],
      requestTime,
      ...urlDetails
    },
    severity: rscMatch ? 'medium' : 'high',
    recoverable: true,
    suggestions: rscMatch 
      ? [
          'Refresh the page to retry navigation',
          'Clear browser cache if issue persists',
          'Try navigating to the page directly'
        ]
      : [
          'Check your internet connection',
          'Retry the request',
          'Verify the server is accessible'
        ]
  };
}

/**
 * Parse API errors
 */
function parseApiError(message: string): Partial<ParsedError> {
  const statusMatch = message.match(/(\d{3})/);
  const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined;
  
  let severity: ParsedError['severity'] = 'medium';
  let suggestions: string[] = [];
  
  if (statusCode) {
    if (statusCode >= 500) {
      severity = 'high';
      suggestions = ['Server error - try again later', 'Contact support if issue persists'];
    } else if (statusCode >= 400) {
      severity = 'medium';
      suggestions = ['Check request parameters', 'Verify authentication if required'];
    }
  }
  
  return {
    type: 'API_ERROR',
    message: `API request failed${statusCode ? ` with status ${statusCode}` : ''}`,
    details: {
      statusCode
    },
    severity,
    recoverable: statusCode !== 404,
    suggestions
  };
}

/**
 * Parse validation errors
 */
function parseValidationError(_message: string): Partial<ParsedError> {
  return {
    type: 'VALIDATION_ERROR',
    message: 'Input validation failed',
    severity: 'low',
    recoverable: true,
    suggestions: [
      'Check input format and requirements',
      'Ensure all required fields are filled',
      'Verify data types match expected format'
    ]
  };
}

/**
 * Main error parsing function
 */
export function parseError(error: string | Error): ParsedError {
  const message = typeof error === 'string' ? error : error.message;
  const originalMessage = message;
  
  let parsedError: Partial<ParsedError>;
  
  // Check for ERR_ABORTED errors
  if (message.includes('ERR_ABORTED') || message.includes('net::ERR_ABORTED')) {
    parsedError = parseAbortedError(message);
  }
  // Check for RSC errors
  else if (message.includes('_rsc') || message.includes('RSC') || message.includes('Server Component')) {
    parsedError = {
      type: 'RSC_NAVIGATION',
      message: 'React Server Component error occurred',
      severity: 'medium',
      recoverable: true,
      suggestions: [
        'Refresh the page',
        'Clear browser cache',
        'Try hard refresh (Ctrl+F5 or Cmd+Shift+R)'
      ]
    };
  }
  // Check for API errors
  else if (message.includes('fetch') || message.includes('HTTP') || /\d{3}/.test(message)) {
    parsedError = parseApiError(message);
  }
  // Check for validation errors
  else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    parsedError = parseValidationError(message);
  }
  // Unknown error
  else {
    parsedError = {
      type: 'UNKNOWN',
      message: 'An unexpected error occurred',
      severity: 'medium',
      recoverable: true,
      suggestions: [
        'Try refreshing the page',
        'Check browser console for more details',
        'Contact support if issue persists'
      ]
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: 'An unexpected error occurred',
    originalMessage,
    details: {},
    severity: 'medium',
    recoverable: true,
    suggestions: ['Try refreshing the page'],
    ...parsedError
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: string | Error): string {
  const parsed = parseError(error);
  return parsed.message;
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: string | Error): ParsedError['severity'] {
  const parsed = parseError(error);
  return parsed.severity;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: string | Error): boolean {
  const parsed = parseError(error);
  return parsed.recoverable;
}

/**
 * Get error suggestions
 */
export function getErrorSuggestions(error: string | Error): string[] {
  const parsed = parseError(error);
  return parsed.suggestions;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: string | Error, context?: Record<string, unknown>): string {
  const parsed = parseError(error);
  
  const logData = {
    type: parsed.type,
    message: parsed.originalMessage,
    severity: parsed.severity,
    details: parsed.details,
    context,
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(logData, null, 2);
}

/**
 * Create error report for debugging
 */
export function createErrorReport(error: string | Error, userAgent?: string): {
  id: string;
  timestamp: string;
  error: ParsedError;
  environment: {
    userAgent?: string;
    url: string;
    timestamp: string;
  };
} {
  const parsed = parseError(error);
  const timestamp = new Date().toISOString();
  
  return {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    error: parsed,
    environment: {
      userAgent,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp
    }
  };
}