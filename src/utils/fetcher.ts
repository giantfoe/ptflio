/**
 * Fetcher utility for SWR data fetching
 * Provides a standardized way to fetch data with error handling
 */

import { createComponentLogger } from './logger';

interface FetchError extends Error {
  info?: unknown;
  status?: number;
}

const logger = createComponentLogger('Fetcher');

export const fetcher = async <T = unknown>(url: string): Promise<T> => {
  logger.debug('Starting fetch', { url });
  
  try {
    const res = await fetch(url);
    logger.debug('Response received', {
      url,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    });
    
    if (!res.ok) {
      const error: FetchError = new Error('An error occurred while fetching the data.');
      // Attach extra info to the error object
      try {
        error.info = await res.json();
      } catch {
        error.info = 'Failed to parse error response';
      }
      error.status = res.status;
      logger.warn('Fetch request failed', { url, status: res.status, statusText: res.statusText });
      throw error;
    }
    
    const data = await res.json() as T;
    logger.debug('Successfully parsed JSON', {
      url,
      dataType: typeof data,
      isArray: Array.isArray(data),
      hasData: !!data
    });
    
    return data;
  } catch (error) {
    logger.warn('Fetch operation failed', { 
      url, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
};

/**
 * Fetcher with custom headers
 */
export const fetcherWithHeaders = (headers: Record<string, string>) => {
  return async <T = unknown>(url: string): Promise<T> => {
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      const error: FetchError = new Error('An error occurred while fetching the data.');
      try {
        error.info = await res.json();
      } catch {
        error.info = 'Failed to parse error response';
      }
      error.status = res.status;
      throw error;
    }
    
    return res.json() as Promise<T>;
  };
};

export default fetcher;