import { NextRequest } from 'next/server';

// Log levels enum for type safety
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Interface for structured log data
interface LogContext {
  component?: string;
  endpoint?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: unknown;
}

// Interface for log entry
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: 'client' | 'server';
}

// Sensitive data patterns to sanitize
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
  /auth/i,
  /credential/i,
  /bearer/i
];

// Sanitize sensitive data from objects
function sanitizeData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Generate request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract context from Next.js request
function extractRequestContext(request?: NextRequest): Partial<LogContext> {
  if (!request) return {};
  
  return {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    requestId: generateRequestId()
  };
}

// Determine if we're in client or server environment
function getEnvironment(): 'client' | 'server' {
  return typeof window === 'undefined' ? 'server' : 'client';
}

// Core logging function
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: getEnvironment()
  };

  if (context) {
    entry.context = sanitizeData(context) as LogContext;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return entry;
}

// Output log entry based on environment
function outputLog(entry: LogEntry): void {
  // In production, only log errors and warnings to console
  // In development, log everything for debugging
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Skip console output in production for info and debug levels
  if (isProduction && (entry.level === LogLevel.INFO || entry.level === LogLevel.DEBUG)) {
    return;
  }
  
  // Format message differently for production vs development
  const logMessage = isDevelopment 
    ? JSON.stringify(entry, null, 2)
    : `[${entry.level}] ${entry.message}${entry.context ? ` - ${JSON.stringify(entry.context)}` : ''}`;
  
  switch (entry.level) {
    case LogLevel.ERROR:
      console.error(logMessage);
      break;
    case LogLevel.WARN:
      console.warn(logMessage);
      break;
    case LogLevel.INFO:
      if (isDevelopment) {
        console.info(logMessage);
      }
      break;
    case LogLevel.DEBUG:
      if (isDevelopment) {
        console.debug(logMessage);
      }
      break;
    default:
      if (isDevelopment) {
        console.log(logMessage);
      }
  }
}

// Logger class with methods for different log levels
export class Logger {
  private defaultContext: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const mergedContext = { ...this.defaultContext, ...context };
    const entry = createLogEntry(level, message, mergedContext, error);
    outputLog(entry);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    // Only log debug in development
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  // Method to create child logger with additional context
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...additionalContext });
  }
}

// Default logger instance
export const logger = new Logger();

// Convenience functions for common use cases
export const createComponentLogger = (componentName: string): Logger => {
  return logger.child({ component: componentName });
};

export const createApiLogger = (endpoint: string, request?: NextRequest): Logger => {
  const context: LogContext = { endpoint };
  if (request) {
    Object.assign(context, extractRequestContext(request));
  }
  return logger.child(context);
};

// Performance timing utility
export class PerformanceTimer {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(operation: string, loggerInstance?: Logger) {
    this.startTime = Date.now();
    this.logger = loggerInstance || logger;
    this.operation = operation;
    this.logger.debug(`Starting ${operation}`);
  }

  end(context?: LogContext): void {
    const duration = Date.now() - this.startTime;
    this.logger.info(`Completed ${this.operation}`, { ...context, duration });
  }

  endWithError(error: Error, context?: LogContext): void {
    const duration = Date.now() - this.startTime;
    this.logger.error(`Failed ${this.operation}`, { ...context, duration }, error);
  }
}

// Export types for use in other files
export type { LogContext, LogEntry };